# tiny-random/ling-3.2-air

## Resumen

`tiny-random/ling-3.2-air` es un modelo de prueba de inicialización aleatoria derivado de `inclusionAI/Ling-3.2-air`, publicado por el usuario `tiny-random`. No es un modelo entrenado: su propósito es servir como fixture reproducible para validar infraestructura de inferencia (en concreto SGLang) y depuración del pipeline multimodal `bailing_moe_v3_vl`. Conserva la topología del modelo original —híbrido de atención lineal KDA y MLA con expertos MoE en FP8— pero con dimensiones reducidas y pesos aleatorios.

El checkpoint ocupa 113,3 MB en un único `model.safetensors` y contiene 72,37 millones de parámetros (40,58 M en BF16, 12,26 K en F32 y 31,78 M en FP8_E4M3), frente a los 129,28 GB y 126,61 B de elementos F8_E4M3 del modelo base. Mantiene el vocabulario de 157.184 tokens sin embeddings atados, 12 capas decodificadoras organizadas en dos ciclos de 6 (5 KDA + 1 MLA), 32 expertos enrutados con 8 activos por token y una torre de visión reducida a anchura 32 y profundidad 4.

Su relevancia es práctica para equipos de infraestructura: permite verificar la carga de pesos FP8 por bloques 128x128, el enrutamiento MoE, la decodificación especulativa MTP y la entrada multimodal imagen-texto sin necesidad de aprovisionar GPUs para un modelo de 130 GB. No debe emplearse para tareas de producción ni para evaluar calidad lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido KDA + MLA con MoE y torre de visión (`bailing_moe_v3_vl`) |
| Parametros totales | 72.369.840 (40,58 M BF16, 12,26 K F32, 31,78 M FP8_E4M3) |
| Parametros activos | 8 de 32 expertos enrutados por token |
| Longitud de contexto | No disponible en la información del repositorio; el ejemplo de servicio usa `--context-length 2048` |
| Tipos de cuantizacion | FP8 E4M3 con bloques 128x128 en expertos; BF16 y F32 en otras partes del checkpoint |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (`model.safetensors`, 113,3 MB) |
| Capas decodificadoras | 12 (dos ciclos de 6: 5 KDA + 1 MLA); 1 capa densa antes del MoE |
| Anchuras | Hidden 128, densa 256, experto 128 |
| Cabezas Q/KV/dimensión | 8 / 8 / 128; Q/K 128 + 64 (nope + rope); V 128 |
| Rango LoRA de KV | 512 |
| Vocabulario / embeddings atados | 157.184 / false |
| Torre de visión | Anchura 32, profundidad 4 |
| Capas MTP | 1 (capa 12) |
| Librería | sglang |

## Arquitectura y entrenamiento

El modelo replica la arquitectura `bailing_moe_v3_vl` del base: un decoder híbrido que alterna capas de atención lineal KDA (Kimi Delta Attention) con capas de atención MLA (Multi-head Latent Attention). En esta versión reducida hay 12 capas organizadas en dos ciclos de 6 (cinco KDA y una MLA por ciclo), una capa densa previa al bloque MoE, 32 expertos enrutados con 8 activos por token y pesos de experto en FP8 E4M3 con cuantización por bloques de 128x128. La atención MLA usa 8 cabezas Q y 8 KV con dimensión 128, anchura Q/K de 128 + 64 (nope + rope) y rango LoRA de KV de 512. Incluye una capa MTP (multi-token prediction) para decodificación especulativa y una torre de visión de anchura 32 y profundidad 4 que habilita la modalidad imagen-texto.

No ha habido entrenamiento. Los pesos son de inicialización aleatoria, generados por un script (`.meta/create_model.py`) a partir de la estructura del modelo original. Por tanto no existen datos de preentrenamiento, ajuste supervisado, RLHF ni DPO asociados a este repositorio, y no se puede hablar de composición de dataset ni de número de tokens. La innovación relevante no es algorítmica sino de ingeniería: empaquetar la topología completa del Ling-3.2-air (MoE FP8, KDA/MLA, MTP, visión) en 113 MB para pruebas de integración.

## Capacidades

- Generación de texto: funcional a nivel de infraestructura, pero sin calidad lingüística al tener pesos aleatorios.
- Procesamiento imagen-texto: acepta contenido `image_url` en mensajes de chat mediante el procesador remoto del checkpoint.
- Tool calling y function calling: no documentado en la información disponible.
- Razonamiento multi-paso y agentes: no documentado; el base incluye capa MTP, pero este checkpoint no ha sido entrenado para tales tareas.
- Multilingüismo: no documentado; el vocabulario de 157.184 tokens es el del modelo base.
- Modo thinking, audio u otras capacidades especiales: no disponibles.
- Validación de infraestructura: carga de pesos FP8 por bloques, enrutamiento MoE, atención híbrida KDA/MLA, decodificación especulativa MTP y pipeline multimodal completo.

## Casos de uso

- Pruebas de integración de SGLang: sirve para verificar que una versión concreta de SGLang carga correctamente un checkpoint `bailing_moe_v3_vl` con expertos FP8 y procesador remoto, sin necesidad de reservar GPUs para 130 GB. El comando de ejemplo del repositorio usa `--tp 2`, `--attention-backend triton` y `--mem-fraction-static 0.2`.
- CI/CD de motores de inferencia: incluir el checkpoint en pipelines automatizados que validen cambios en el parser de pesos, el enrutador MoE o el manejo de bloques FP8 128x128 antes de desplegar el modelo real.
- Desarrollo de clientes multimodales: permite probar el envío de contenido `image_url` en formato base64 y validar el contrato de la API OpenAI-compatible de SGLang (`/v1/chat/completions`) sin coste de inferencia real.
- Depuración de decodificación especulativa: al conservar la capa MTP en la posición 12, se puede ejercitar el camino de código de multi-token prediction y comprobar que el servidor gestiona correctamente las cabezas auxiliares.
- Validación de cuantización FP8: útil para comprobar que las herramientas de carga interpretan correctamente las escalas por bloque 128x128 en los expertos y no confunden tensores BF16, F32 y F8_E4M3 mezclados en el mismo checkpoint.
- Formación y demos de arquitectura: sirve para explicar en talleres cómo se organiza un decoder híbrido KDA/MLA con MoE y torre de visión, inspeccionando las formas de los tensores sin descargar 129 GB.
- Pruebas de memoria y planificación de sharding: con 113 MB se puede simular el reparto de capas entre dispositivos (`--tp`) y verificar la lógica de particionado antes de aplicarla al modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un checkpoint de inicialización aleatoria, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, MMMU) sería equivalente a azar y no aportaría información sobre el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 para los pesos (72,37 M de parámetros, de los cuales 31,78 M están en FP8); el grueso del consumo proviene de cachés KV y del runtime de SGLang.
- GPU recomendadas: cualquier GPU con soporte de Triton y BF16; el ejemplo oficial usa `--tp 2`, pero por tamaño cabría en una sola GPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: SGLang es la vía verificada por el autor (`sglang serve --model-path tiny-random/ling-3.2-air --tp 2 --dtype bfloat16 --attention-backend triton --enable-multimodal --trust-remote-code --context-length 2048 --mem-fraction-static 0.2`). Requiere `opencv-python-headless` porque el procesador remoto importa `cv2`. No hay constancia de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Propósito |
|---|---|---|---|---|---|
| `tiny-random/ling-3.2-air` | 72,37 M (8/32 expertos activos) | No disponible (ejemplo con 2048) | Imagen-texto | No disponible | Fixture de prueba |
| `inclusionAI/Ling-3.2-air` (base) | 126,61 B en FP8 (según tabla del autor) | No disponible | Imagen-texto | No disponible | Modelo real |
| Otros checkpoints `tiny-random` de HF | Variable, típicamente < 1 B | No disponible | Según base | No disponible | Fixtures de prueba |

La comparación relevante es con su modelo base: misma topología (KDA/MLA, MoE con 8 expertos activos, MTP, visión), pero 12 capas frente a 42, 32 expertos frente a 512 y anchuras reducidas (128/256/128 frente a 2.560/6.144/768). No se dispone de datos de benchmarks del base en la información proporcionada para comparar rendimiento.

## Limitaciones y advertencias

- Pesos aleatorios: las salidas no tienen significado; el modelo no debe usarse para generar texto, responder preguntas ni procesar imágenes reales en producción.
- Sin licencia declarada: la ausencia de licencia impide asumir derechos de uso comercial o redistribución; hay que consultar la licencia del modelo base `inclusionAI/Ling-3.2-air`.
- Idiomas no declarados: no se puede garantizar cobertura multilingüe.
- Dependencia de código remoto: el procesador es `trust-remote-code` e importa `cv2`, lo que introduce superficie de ejecución de código de terceros en el servidor.
- Contexto no documentado: la longitud de contexto real del base no aparece en el repositorio; el valor 2048 es solo del ejemplo de lanzamiento.
- Riesgo de confusión: el nombre `ling-3.2-air` puede llevar a error; conviene etiquetarlo claramente como fixture en cualquier catálogo interno.
- Sin benchmarks: no hay evidencia de calidad ni de rendimiento, ni siquiera del modelo base, en la información disponible.
- Generado automáticamente: el autor indica que el repositorio lo generó "GPT-6.1-Sol", sin revisión humana documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tiny-random/ling-3.2-air
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Script de creación: `.meta/create_model.py` (dentro del repositorio)
- Estructura del modelo: `.meta/model.log` (dentro del repositorio)
- Entorno de generación: `.meta/env.json` (dentro del repositorio)
