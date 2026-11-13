# tiny-random/minimax-m3.1-flash

## Resumen

`tiny-random/minimax-m3.1-flash` es un checkpoint de depuración publicado por el usuario `tiny-random`, derivado de la configuración de `MiniMaxAI/MiniMax-M3.1-Flash`. No es un modelo funcional: sus pesos están inicializados aleatoriamente con `torch.manual_seed(42)` y su propósito declarado es servir como fixture de pruebas para validar cargadores, esquemas de tensores y rutas de cuantización mixta del modelo original. Con 14.038.240 parámetros totales y un tamaño de repositorio de 0,1 GB, replica la estructura del M3.1 Flash a escala reducida.

La relevancia técnica del artefacto está en que reproduce fielmente el esquema de nombres y los formatos de cuantización del checkpoint fuente: capas densas y atención en MXFP8, expertos enrutados en NVFP4, y una rama de borrador DSpark de 5 etapas. Esto permite a los desarrolladores de SGLang y de Transformers comprobar la lógica de carga y el empaquetado de tensores sin necesidad de descargar ni ejecutar el modelo completo.

El modelo base pertenece a la familia MiniMax M3, con arquitectura Mixture-of-Experts multimodal (texto y visión) y atención dispersa con indexador en todas las capas. La model card advierte explícitamente de que la flota de validación H20 disponible no dispone de la ruta de ejecución Blackwell NVFP4 requerida por los expertos del modelo fuente, por lo que el comando de lanzamiento en SGLang con TP=4 se presenta como no verificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts multimodal (texto + visión) con atención dispersa e indexador, rama de borrador DSpark |
| Parámetros totales | 14.038.240 |
| Parámetros activos | No disponible (el modelo fuente usa top-k = 4 de 128 expertos enrutados más 1 compartido, pero no se publica el recuento activo del tiny) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | MXFP8 (capas densas y atención) y NVFP4 (expertos enrutados); matrices de embedding y LM head en BF16 sin atar |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (`model.safetensors` 28,3 MB y `dspark/model.safetensors` 6,5 MB) |
| Capas de texto / prefijo denso | 8 / 3 |
| Expertos enrutados / top-k / compartidos | 128 / 4 / 1 |
| Hidden size / dimensión de cabeza | 32 / 32 |
| Capas de visión / ancho | 2 / 64 |
| Rama de borrador | DSpark de 5 etapas |
| Librería declarada | sglang |
| Repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El checkpoint replica el grafo del M3.1 Flash original a escala mínima: 8 capas de texto con un prefijo denso de 3 capas y capas MoE a partir de la cuarta (`moe_layer_freq = [0, 0, 0, 1, ...]`), 128 expertos enrutados con top-k = 4 y un experto compartido. La atención dispersa con indexador está presente en todas las capas (`sparse_attention_freq = [1] * 8`), con `sparse_index_dim` de 32, tamaño de bloque de 32 y top-k de 1 bloque. La torre de visión consta de 2 capas con ancho 64 y un proyector de dimensión 32.

El modelo no ha sido entrenado: los tensores se generan con una normal de media 0 y desviación 0,1, y los pesos MXFP8 se muestrean en BF16 y se convierten a `float8_e4m3fn` con escalas E8M0 fijas a 127 (que codifica 1,0). Los expertos NVFP4 se empaquetan con dos valores por byte y escala E4M3 cada 16 columnas, siguiendo el esquema del cargador oficial de SGLang. La innovación destacable del artefacto es que Transformers puede instanciar el grafo M3 VL nativo pero no serializar el layout NVFP4 de los expertos enrutados, de modo que el checkpoint adopta los nombres de origen del cargador de SGLang como representación autoritativa. Las matrices de embedding y LM head se conservan sin atar en BF16, lo que por sí solo ocupa 25.608.192 bytes y hace que el checkpoint completo supere el objetivo blando de 30 MB.

## Capacidades

- No dispone de capacidades funcionales: los pesos son aleatorios y la salida no es coherente.
- Sirve como fixture para validar la carga del grafo M3 VL (texto y visión) en SGLang y Transformers.
- Permite comprobar el empaquetado y desempaquetado de expertos NVFP4 y de capas MXFP8 con escalas UE8M0.
- Valida la serialización de la rama de borrador DSpark de 5 etapas.
- Valida la tokenización, el chat template y los procesadores de imagen y vídeo copiados del modelo fuente.
- No soporta tool calling, agentes, razonamiento multilingüe ni modo thinking de forma útil.

## Casos de uso

- Pruebas de integración del cargador de SGLang: ejecutar `sglang.launch_server` con `--trust-remote-code` sobre este checkpoint para verificar que el pipeline de carga acepta los nombres de tensor y los formatos de cuantización del M3.1 Flash antes de desplegar el modelo real.
- Desarrollo de kernels NVFP4: usar los tensores empaquetados como entrada determinista para validar rutas de decodificación de 4 bits y escalas E4M3 en GPUs Blackwell.
- Regresión de cuantización mixta: comprobar que una herramienta de conversión respeta la separación entre capas MXFP8 y expertos NVFP4, y que las capas ignoradas (`embed_tokens`, `lm_head`, `vision_tower`, `multi_modal_projector` y las puertas MoE) permanecen en BF16.
- Validación de serialización en Transformers: verificar que el grafo M3 VL nativo se instancia correctamente con la configuración reducida y detectar discrepancias frente al layout de SGLang.
- Pruebas de CI en pipelines de modelos: al ocupar 0,1 GB, cabe en cualquier runner y permite ejecutar tests de humo de carga y forward pass sin GPUs de gran memoria.
- Depuración de la torre de visión y el proyector: ejercitar el procesador de imagen y vídeo con la configuración mínima (imagen de 28 px, ancho 64) para aislar errores de preprocesado.
- Verificación de la rama DSpark: probar la lógica de decodificación especulativa con 5 etapas sobre pesos aleatorios para comprobar contratos de formas y tipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica además que el comando de lanzamiento en SGLang con TP=4 figura como no verificado, ya que la flota H20 de validación no ofrece la ruta de ejecución Blackwell NVFP4 que requieren los expertos del modelo fuente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 para los 14 millones de parámetros; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquiera con soporte de `float8_e4m3fn` para inspeccionar los tensores MXFP8; la ejecución real de los expertos NVFP4 requiere arquitectura Blackwell (no verificada en H20).
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU para tareas de inspección de pesos.
- Opciones de despliegue: SGLang con `--trust-remote-code` y `--tp-size 4` (no verificado); Transformers puede instanciar el grafo pero no serializar el layout NVFP4.
- Latencia y throughput: no disponibles; al ser un modelo aleatorio de depuración, las métricas de rendimiento no son representativas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tiny-random/minimax-m3.1-flash | 14.038.240 | No disponible | Fixture de depuración con esquema M3.1 Flash | No disponible | Hugging Face |
| MiniMaxAI/MiniMax-M3.1-Flash | No disponible en la información | No disponible | Modelo multimodal MoE de producción | No disponible | Hugging Face |
| Otros checkpoints `tiny-random` | Variable (típicamente millones) | No disponible | Pruebas de carga y CI | No disponible | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de depuración) no está disponible en la información proporcionada más allá de la referencia genérica a la familia `tiny-random`.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: el modelo no genera texto, código ni respuestas coherentes; no debe usarse en producción ni para evaluación de calidad.
- Sesgos: no evaluables, al no existir entrenamiento; los tensores aleatorios no reflejan la distribución del modelo fuente.
- Riesgo de alucinación: total, en el sentido de que cualquier salida es ruido sin relación con la entrada.
- La licencia no está declarada en la información disponible; debe consultarse la del modelo base `MiniMaxAI/MiniMax-M3.1-Flash` antes de cualquier uso derivado.
- Idiomas y contexto no documentados; no se puede asumir ninguna capacidad multilingüe ni ventana de contexto concreta.
- El comando de SGLang con TP=4 está marcado como no verificado por falta de hardware Blackwell NVFP4 en la flota de validación.
- Transformers no puede serializar el layout NVFP4 de los expertos enrutados; el esquema de nombres de SGLang es la referencia autoritativa.
- El checkpoint supera intencionadamente el objetivo de 30 MB por conservar las matrices de embedding y LM head sin atar en BF16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tiny-random/minimax-m3.1-flash
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3.1-Flash
- Revisión del modelo base referenciada en el script: `54e4e69dfc452b1e94a426c24a4fdeeaa8e3ad5e`
- SGLang: https://github.com/sgl-project/sglang
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
