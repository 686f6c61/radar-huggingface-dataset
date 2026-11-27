# yujiepan/ling-3.2-air-tiny-random

## Resumen

`yujiepan/ling-3.2-air-tiny-random` es un checkpoint de inicialización aleatoria de tamano reducido construido a partir de la arquitectura de `inclusionAI/Ling-3.2-air`. No es un modelo entrenado ni utilizable para tareas reales: su proposito es servir como banco de pruebas para validar el pipeline de carga, servido e inferencia de la arquitectura `bailing_moe_v3_vl` en entornos de desarrollo, sin necesidad de descargar el checkpoint completo de 129 GB.

El modelo reproduce fielmente la estructura del modelo base: decodificador hibrido con capas KDA (Kimi Delta Attention) y MLA (Multi-head Latent Attention) en ciclos de 6 capas (5 KDA + 1 MLA), expertos enrutados en precision FP8 con bloques de 128x128, capas MTP (Multi-Token Prediction) y torre de vision para entrada image-text-to-text. Los pesos se han reducido drasticamente (anchuras de 128 en lugar de 2.560, 32 expertos en lugar de 512), pero se conservan decisiones estructurales como el vocabulario de 157.184 tokens y el rango de LoRA de KV de 512.

Es relevante ahora porque permite a desarrolladores que integran SGLang o investigan arquitecturas MoE hibridas con vision validar su tooling de despliegue con un artefacto de 113 MB, verificando compatibilidad de kernels, backend de atencion Triton y procesador multimodal antes de comprometer recursos en el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido KDA + MLA con torre de vision (`bailing_moe_v3_vl`) |
| Parametros totales | 72.369.840 |
| Parametros activos | no disponible (8 expertos enrutados por token de 32 totales) |
| Longitud de contexto | no disponible (el ejemplo de servido usa `--context-length 2048`) |
| Tipos de cuantizacion | FP8 E4M3 con bloques 128x128 en expertos; BF16 y F32 en resto de tensores |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (un unico archivo `model.safetensors`, 113,3 MB) |

## Arquitectura y entrenamiento

El checkpoint replica la topologia del modelo base Ling-3.2-air: 12 capas de decodificador organizadas en dos ciclos de 6 capas, cada ciclo con 5 capas KDA y 1 capa MLA. Incluye una capa densa antes del bloque MoE, 32 expertos enrutados con 8 activos por token, y una capa MTP adicional en la posicion 12. Las dimensiones internas se han comprimido: hidden de 128 (frente a 2.560), anchura densa de 256 (frente a 6.144) y anchura de experto de 128 (frente a 768). Se mantienen 8 cabezas Q y 8 cabezas KV con dimension de cabeza 128, anchura Q/K de 128 + 64 (nope + rope), anchura V de 128 y rango de LoRA de KV de 512.

La torre de vision se reduce a anchura 32 y profundidad 4 (frente a 1.152 y 27). Los expertos conservan la cuantizacion FP8 con bloques de 128x128 del modelo original, con 31,78M elementos F8_E4M3, 40,58M BF16 y 12,26K F32. No hay entrenamiento: los pesos son inicializaciones aleatorias. El vocabulario de 157.184 tokens y la ausencia de embeddings atados se preservan para mantener compatibilidad con el tokenizador y el procesador remotos del modelo base.

## Capacidades

- No dispone de capacidades funcionales reales: al ser pesos aleatorios, no genera texto coherente ni respuestas correctas.
- Sirve como fixture de test para validar la ruta image-text-to-text (procesador multimodal con `image_url` en el payload de chat completions).
- Permite verificar la carga de codigo remoto (`--trust-remote-code`) y la dependencia de `opencv-python-headless` en el procesador.
- Util para probar el backend de atencion Triton y el servido nativo de `bailing_moe_v3_vl` en SGLang.
- Valida la ruta de tensores FP8 con bloques 128x128 en expertos enrutados.
- No soporta tool calling, agentes ni razonamiento multilingue de forma efectiva.

## Casos de uso

- Validacion de pipeline SGLang: lanzar `sglang serve` con `--tp 2`, `--attention-backend triton` y `--enable-multimodal` para comprobar que el entorno acepta la arquitectura `bailing_moe_v3_vl` antes de desplegar el modelo completo de 129 GB.
- Test de integracion continua: incluir el checkpoint en la suite de tests de un fork de SGLang o de un runtime propio para detectar regresiones en la carga de MoE hibrido con FP8 por bloques.
- Desarrollo de procesadores multimodales: verificar el flujo de `image_url` con imagenes base64 sin consumir VRAM significativa, util para depurar el preprocesado de vision.
- Pruebas de compatibilidad de tokenizador: al conservar el vocabulario de 157.184 tokens, sirve para validar pipelines de tokenizacion y plantillas de chat del modelo base.
- Benchmarking de overhead de servido: medir latencia de arranque, memoria estatica (`--mem-fraction-static 0.2`) y throughput de un servidor SGLang con un checkpoint minimo.
- Formacion y demos: material didactico para explicar la estructura interna de un MoE hibrido KDA/MLA sin requerir hardware de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) careceria de sentido.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 para los 72,4M parametros; el ejemplo oficial usa `--mem-fraction-static 0.2` y `--context-length 2048`.
- GPU recomendadas: cualquier GPU consumer con soporte BF16 y FP8 (RTX 4090, RTX 3090, L4, A10); el ejemplo de servido usa `--tp 2`, aunque cabe en una sola GPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna con al menos 2 GB de VRAM.
- Opciones de despliegue: SGLang es la via verificada por el autor (`sglang serve`). Otros runtimes no estan documentados para esta arquitectura.
- Latencia y throughput: no disponibles; al ser un modelo diminuto, la latencia vendra dominada por el overhead del servidor y el preprocesado multimodal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `yujiepan/ling-3.2-air-tiny-random` | 72,4M | no disponible | no disponible | Test y depuracion |
| `inclusionAI/Ling-3.2-air` (base) | no disponible (checkpoint de 129,28 GB) | no disponible | no disponible | Modelo real image-text-to-text |
| Otros tiny-random de Hugging Face | variable | no disponible | variable | Fixtures de test |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: el modelo no produce salidas coherentes y no debe usarse en produccion ni en evaluaciones de calidad.
- La licencia no esta declarada en la informacion disponible; verificar los terminos del modelo base `inclusionAI/Ling-3.2-air` antes de cualquier uso.
- Requiere `--trust-remote-code` por el procesador remoto, lo que implica ejecutar codigo de terceros en el servidor.
- Dependencia adicional de `opencv-python-headless` para el procesado de imagenes.
- Idiomas soportados no documentados.
- Longitud de contexto nativa del modelo base no disponible; el valor 2048 del ejemplo es solo una configuracion de servido.
- El checkpoint se genero con asistencia de un modelo (GPT-6.1-Sol segun la model card); revisar los scripts en `.meta/` antes de confiar en la estructura.
- No apto para benchmarks, evaluaciones de sesgo ni despliegues de atencion al cliente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yujiepan/ling-3.2-air-tiny-random
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Script de creacion: `.meta/create_model.py` (dentro del repositorio)
- Log de estructura: `.meta/model.log` (dentro del repositorio)
- Entorno de generacion: `.meta/env.json` (dentro del repositorio)
- SGLang: https://github.com/sgl-project/sglang
