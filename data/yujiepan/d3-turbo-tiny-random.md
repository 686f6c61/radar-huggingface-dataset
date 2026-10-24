# yujiepan/d3-turbo-tiny-random

## Resumen

`yujiepan/d3-turbo-tiny-random` es un modelo mínimo de depuración publicado por el desarrollador yujiepan, pensado exclusivamente para probar infraestructura de inferencia. No es un modelo entrenado: se inicializa de forma aleatoria (`torch.nn.init.normal_`, semilla 42) a partir de la configuración adaptada de `vllm-sr/d3-turbo`, el modelo de decisión multimodal de 27B de la familia Decision 3.0 de vLLM Semantic Router. Con 8.200.620 parámetros totales (según safetensors), reproduce la interfaz pública `system_one()` del modelo original: recibe texto, imágenes y vídeo junto con un conjunto de preguntas nombradas y devuelve decisiones estructuradas.

La arquitectura imita la del original a escala reducida: backbone Qwen3.5 con atención híbrida (capas Gated DeltaNet lineal y capas de atención completa en cadencia 3:1), codificador visual y una cabeza de lectura lineal de 255 vías en FP32, almacenada aparte en `readout.safetensors`. En la versión tiny el ancho oculto baja a 32, la MLP a 64, el vocabulario se mantiene en 248.320 filas y el número de capas de texto pasa de 64 a 8 (dos ciclos completos del patrón lineal/completa).

Su relevancia es práctica y acotada: permite validar en CPU o en cualquier GPU la carga con `trust_remote_code`, los procesadores de imagen y vídeo, la tokenización, el runtime de decisión y los kernels de atención lineal sin consumir los recursos del modelo de 27B. Los pesos del repo ocupan 16,4 MB, lo que lo convierte en un artefacto útil para tests de CI, reproducción de errores y desarrollo de harnesses de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5: capas de atención lineal Gated DeltaNet + capas de atención completa (8 capas, patrón 3 lineales + 1 completa, dos ciclos), más codificador visual y cabeza de decisión lineal |
| Parámetros totales | 8.200.620 (dato real de safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No se publican cuantizaciones; pesos en BF16 (backbone) y FP32 (readout) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (`model.safetensors`, 16,4 MB; `readout.safetensors`, ~0 MB) + código Python de runtime personalizado (`custom_code`) |

Datos estructurales comparados con `vllm-sr/d3-turbo` (fuente: model card):

| Característica | d3-turbo (fuente) | tiny-random |
|---|---|---|
| Interfaz pública | decisión D3 `system_one()` | misma `system_one()` |
| Modalidades de entrada | texto, imagen, vídeo | las mismas |
| Filas de vocabulario / dtype de embedding | 248.320 / BF16 | igual |
| Capas de texto y cadencia | 64; 3 lineales + 1 completa | 8; dos ciclos |
| Ancho de texto / dimensión de cabeza | 5.120 / 256 | 32 / 32 |
| Cabezas y dimensiones K/V de atención lineal | 16 / 48; 128 / 128 | 1 / 1; 32 / 32 |
| Ancho de MLP de texto | 17.408 | 64 |
| Profundidad / ancho / ancho de salida de visión | 27 / 1.152 / 5.120 | 2 / 32 / 32 |
| Cabeza de decisión | 255 vías FP32 | la misma |
| Precisión almacenada | backbone BF16 + readout FP32 | igual |

## Arquitectura y entrenamiento

No hay entrenamiento. El script de creación incluido en la model card descarga el `config.json` de `vllm-sr/d3-turbo` (revisión `a0f3e9e59...`), reduce las dimensiones del `text_config` y del `vision_config`, instancia `Qwen3_5Model` en BF16 e inicializa cada peso flotante con una normal de media 0 y desviación 0,02, salvo las normas (que se ponen a cero en las RMSNorm del language model, que implementan `1 + weight`, y a uno en el resto), y salvo `linear_attn.A_log` y `linear_attn.dt_bias`, que conservan la inicialización nativa de DeltaNet porque controlan el decaimiento recurrente. La cabeza de lectura se genera como `torch.nn.Linear(32, 255, bias=False)` en FP32 y se serializa por separado.

El resultado es un checkpoint de decisión D3, no un checkpoint de generación de texto. El runtime original aporta atención completa prefijo-bidireccional sobre las capas causales Gated DeltaNet, y el paquete tiny preserva el runtime crudo, la configuración de decisión, el tokenizador y los procesadores de imagen y vídeo copiados byte a byte desde el modelo fuente (`chat_template.jinja`, `d3_compose.py`, `d3_engine.py`, `d3_fast.py`). Se aplica también M-RoPE con `mrope_section = [1, 1, 2]`.

La innovación técnica que se puede evaluar aquí no está en los pesos, sino en la estructura: cadencia de atención híbrida, atención lineal con estado recurrente, procesamiento conjunto de texto, imagen y vídeo, y una salida de 255 logits interpretada como distribución de probabilidad sobre decisiones en una sola pasada forward.

## Capacidades

- Interfaz `system_one(state, questions, images, videos)` que devuelve una respuesta por cada pregunta nombrada.
- Entrada multimodal: texto, estado estructurado (JSON), imágenes PIL y vídeo como array de fotogramas (`np.stack`).
- Tipos de pregunta del modelo fuente: elección entre opciones, sí/no, puntuación en escala, localización de caja (*box localization*) y seguimiento (*tracking*), resueltos en una única pasada forward.
- Salida probabilística mediante cabeza de lectura de 255 vías, en lugar de texto generado token a token.
- Extracción de características (`pipeline_tag: feature-extraction`) a través del backbone.
- Soporte de los procesadores de imagen y vídeo originales, incluido el pipeline de preprocesado.
- No soporta generación de texto libre, tool calling, agentes ni razonamiento multi-paso: no es su cometido y, además, los pesos son aleatorios.

## Casos de uso

- Test de integración en CI: cargar el modelo con `AutoModel.from_pretrained(..., trust_remote_code=True)` en cada commit para detectar roturas de API en `transformers` o en el runtime de decisión, con 16,4 MB de descarga y sin GPU dedicada.
- Validación de kernels de atención lineal: sirve para comprobar que la implementación de Gated DeltaNet y la atención completa prefijo-bidireccional producen formas y dtypes correctos antes de pasar al modelo de 27B.
- Pruebas de los procesadores de imagen y vídeo: verificar el preprocesado de fotogramas, el `mrope_section` y las formas de entrada del codificador visual con tensores pequeños y controlables.
- Reproducción de incidencias: al ser determinista en su inicialización (semilla 42) y diminuto, permite compartir un caso reproducible en un issue sin adjuntar pesos grandes.
- Desarrollo del harness de evaluación de decisiones: implementar y depurar la lógica que envía preguntas tipadas (`choice`, `yes/no`, `score`, `box`, `tracking`) y parsea las probabilidades devueltas, antes de conectar con `d3-turbo`.
- Docencia y demostraciones en local: ilustrar una arquitectura híbrida multimodal con cabeza de clasificación en un portátil sin GPU, mostrando la estructura de configuración y el flujo de datos.
- Pruebas de compatibilidad de despliegue: comprobar el arranque del paquete con código personalizado en entornos aislados y con `torch.cuda.set_device("cuda:0")`, que la model card señala como requisito del runtime fijado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Cualquier métrica de calidad (MMLU, HumanEval, GSM8K o precisión en tareas de decisión) sería inaplicable, dado que los pesos están inicializados aleatoriamente y el modelo no ha recibido entrenamiento.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB en inferencia; los pesos en BF16 suman unos 16,4 MB y la cabeza de lectura 255 × 32 × 4 bytes ≈ 32,6 KB.
- GPU recomendadas: cualquiera; no requiere GPU. Funciona en CPU, y el ejemplo de la model card usa `device="cuda:0"` si hay CUDA disponible (no acepta el alias `"cuda"` porque el runtime llama a `torch.cuda.set_device()` durante la construcción).
- GPU de consumo: cabe en cualquier GPU de consumo, integrada o incluso en entornos sin acelerador; el cuello de botella es el código Python del runtime, no el cálculo.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (verificado por el autor); el paquete incluye runtime propio (`d3_engine.py`, `d3_fast.py`, `d3_compose.py`). No hay GGUF ni soporte documentado para llama.cpp u Ollama en esta variante tiny; la familia fuente `d3` sí aparece publicada en el catálogo de Ollama.
- Latencia y throughput: no disponibles. Por tamaño, la latencia estará dominada por la sobrecarga de carga del modelo y del código personalizado, no por el cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yujiepan/d3-turbo-tiny-random` | 8,2 M | Decisión multimodal D3 (aleatorio) | No disponible | No disponible | HuggingFace, 0 descargas |
| `vllm-sr/d3-turbo` | 27B (según fuentes web) | Decisión multimodal D3 (entrenado) | No disponible | No disponible | HuggingFace; familia publicada en Ollama |
| `yujiepan/deepseek-v3.1-tiny-random` | No disponible | Tiny aleatorio para depuración, adaptado de DeepSeek-V3.1 | No disponible | No disponible | HuggingFace |
| `yujiepan/llama-3.1-tiny-random` | 1,03 M | Generación de texto aleatoria para depuración | No disponible | No disponible | HuggingFace, 405 descargas |

Frente a los otros tiny-random del mismo autor, este se distingue por conservar el vocabulario completo del modelo fuente (248.320 filas, que suponen unos 7,95 M de los 8,2 M de parámetros) y por mantener la interfaz de decisión en lugar de una cabeza de lenguaje.

## Limitaciones y advertencias

- Los pesos son aleatorios: las salidas no tienen ningún significado semántico. No debe usarse para tomar decisiones reales ni para evaluar calidad.
- No es un modelo de generación de texto; no dispone de cabeza de lenguaje utilizable ni de plantilla de chat funcional para completar texto.
- Licencia no especificada: no hay autorización explícita para uso comercial y la situación legal es incierta, algo especialmente relevante porque hereda estructura y código del modelo base.
- Requiere `trust_remote_code=True`: ejecuta código Python del autor (`d3_engine.py`, `d3_fast.py`, `d3_compose.py`), lo que implica riesgo de seguridad en entornos compartidos o multiusuario.
- Dependencia de un runtime fijado: el código exige `torch.cuda.set_device()` con índice (`cuda:0`), y rompe con el alias `"cuda"`; también puede fallar ante cambios de versión en `transformers`.
- El ejemplo de la model card usa `model_id = "tiny-random/d3-turbo"`, que no coincide con el ID real del repositorio; debe sustituirse por `yujiepan/d3-turbo-tiny-random`.
- Solo reproduce estructura, no comportamiento: cualquier conclusión sobre precisión, sesgos o capacidades multilingües del modelo fuente es inválida a partir de este checkpoint.
- Los idiomas soportados no están declarados; la composición del vocabulario proviene del modelo fuente y no se ha validado.
- Sin cuantizaciones publicadas ni artefactos GGUF, lo que limita las pruebas de despliegue en stacks ligeros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yujiepan/d3-turbo-tiny-random
- Modelo base: https://huggingface.co/vllm-sr/d3-turbo
- Perfil del autor: https://huggingface.co/yujiepan
- `yujiepan/deepseek-v3.1-tiny-random`: https://huggingface.co/yujiepan/deepseek-v3.1-tiny-random
- `yujiepan/llama-3.1-tiny-random`: https://huggingface.co/yujiepan/llama-3.1-tiny-random
- Familia d3 en Ollama: https://ollama.com/library/d3
- Ficha de d3-turbo en AI Wiki: https://aiwiki.ai/wiki/d3_turbo
- Ficha de d3-turbo en There's An AI For That: https://theresanaiforthat.com/model/d3-turbo/
