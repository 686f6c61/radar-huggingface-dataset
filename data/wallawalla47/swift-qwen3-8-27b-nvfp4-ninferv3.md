# wallawalla47/Swift-Qwen3.8-27B-NVFP4-NInferV3

## Resumen

Swift-Qwen3.8-27B-NVFP4-NInferV3 es un artefacto de un solo fichero en formato NInfer V3 (extensión `.ninfer`) de 22,78 GB que empaqueta una cuantización mixta NVFP4/FP8 del modelo ukisai/Swift-Qwen3.8-27B-NVFP4, a su vez un fine-tune orientado a razonamiento eficiente de Qwen3.8-27B. Lo publica el usuario wallawalla47 bajo el identificador de HuggingFace indicado, y está diseñado para ejecutarse sin paso de conversión en carga: se apunta el motor Infernix (recomendado) o NInfer directamente al fichero `.ninfer`.

El modelo conserva el backbone híbrido de la familia Qwen3.5 con 64 capas que combinan atención lineal Gated Delta-Net y atención completa cada cuatro capas, hidden de 5120, vocabulario de 248.320 tokens y contexto nativo de 262.144 tokens. Incluye torre de visión `qwen3_5_vision` de 27 capas para entrada de imagen y vídeo, una cabeza MTP para decodificación especulativa y dos componentes adicionales de drafting (un modelo borrador DFlash2 de 5 capas y una cabeza de propuesta indexada de 131.072 filas).

Su relevancia es acotada y muy específica: es un artefacto de hobby, generado en buena parte con IA (según declara el propio autor), pensado para GPUs Blackwell de consumo como la RTX 5090 (sm_120a) y para los motores Infernix/NInfer. No aporta resultados de benchmarks propios publicados, y su interés principal es servir como ejemplo de empaquetado de pesos NVFP4/FP8 importados bit-exactos junto a rutas de decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone hibrido de la familia Qwen3.5: 64 capas con Gated Delta-Net (atencion lineal) y atencion completa cada 4 capas; hidden 5120; vocab 248.320; torre de vision qwen3_5_vision (profundidad 27); cabeza MTP; borrador DFlash2 |
| Parametros totales | 27B segun la nomenclatura del modelo (desglose exacto no disponible) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 262.144 tokens (contexto nativo declarado) |
| Tipos de cuantizacion | NVFP4 (W4A4) en 128 objetos; FP8 e4m3fn con escala por fila en 130 objetos; ademas 55 objetos Q4, 54 Q5, 28 Q8, 1 Q6 (escalas FP16 agrupadas), 579 BF16 y 96 FP32; 1 tabla de indices INT32 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como `other`); los componentes base Qwen3.8-27B y DFlash2 son Apache 2.0 |
| Formato de pesos | Fichero unico NInfer V3 (`.ninfer`), dependiente del motor ninfer/Infernix |
| Tamano del repositorio | 22,8 GB (fichero principal de 22.783.240.704 bytes; informe de conversion JSON de 506.626 bytes) |
| Modelo base | ukisai/Swift-Qwen3.8-27B-NVFP4 (relacion: `quantized`) |
| Tipo de pipeline | image-text-to-text (multimodal) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer hibrido de la familia Qwen3.5: 64 capas que alternan atención lineal Gated Delta-Net con capas de atención completa cada cuatro capas, dimensión oculta de 5120 y vocabulario de 248.320 tokens. Sobre ese backbone se añaden la torre de visión `qwen3_5_vision` de 27 capas para entradas de imagen y vídeo, una cabeza MTP (Multi-Token Prediction) afinada por UkisAI, un modelo borrador DFlash2 de 5 capas con atención deslizante (ventana 2048, selector de rango 256 con top-16) y una cabeza de propuesta indexada de 131.072 filas recolectada de la cabeza de salida.

El proceso de creación no entrena el modelo desde cero: parte del checkpoint ukisai/Swift-Qwen3.8-27B-NVFP4 (revisión `17d5f9df`), cuantizado por UkisAI con NVIDIA Model Optimizer siguiendo el mapeo de precisión de nvidia/Qwen3.8-27B-NVFP4, y calibrado con Local-Hessian NVFP4 sobre 2.048 muestras de post-entrenamiento de Nemotron. Las proyecciones MLP (128 objetos NVFP4) y las proyecciones de auto-atención y de atención lineal GDN (128 objetos FP8) se importan en su forma codificada bit-exacta, sin re-cuantización; la cabeza de salida se descuantiza y se re-cuantiza a FP8 con escala por fila (`fp8_row_maxabs`), y la embedding también se re-cuantiza. La conversión se realizó con el recetario `qwen3_8_27b_nvfp4_nvidia` del convertidor de Infernix en CPU (aproximadamente 4-5 minutos), con los componentes `text, vision, mtp` más la cabeza de propuesta, añadiendo después el componente DFlash2.

El componente diferenciador del proyecto original "Swift" (de UkisAI) es un ajuste fino orientado a eficiencia de razonamiento: alcanzar las mismas respuestas con cadenas de pensamiento más cortas. El autor de este artefacto declara explícitamente que no ha verificado esas mediciones. La innovación técnica del artefacto en sí es el empaquetado single-file con rutas de decodificación especulativa integradas (MTP, DFlash2 y `--lm-head-draft`) sobre kernels W4A4 NVFP4.

## Capacidades

- Generación de texto y razonamiento con modo "thinking", optimizado para reducir la longitud de la cadena de pensamiento sin cambiar la respuesta final.
- Entrada multimodal de imagen y vídeo mediante la torre de visión `qwen3_5_vision` (pipeline `image-text-to-text`).
- Procesamiento de contexto largo: 262.144 tokens nativos, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Decodificación especulativa integrada: cabeza MTP, modelo borrador DFlash2 (`--spec dflash2`) y drafting por copia mediante cabeza de propuesta indexada (`--lm-head-draft`).
- Uso agéntico y multi-step reasoning, con soporte de cache de prefijo para reutilizar prompts largos (el autor reporta un 90 % de tokens de prompt servidos desde caché en una repetición de codificación agéntica).
- Inferencia cuantizada W4A4 NVFP4 para las proyecciones MLP y FP8 por fila para atención y GDN.
- Generación de código: no se documenta de forma explícita, pero el escenario de referencia del motor es una repetición de codificación agéntica.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Codificación agéntica en local: con 262.144 tokens de contexto y cache de prefijo, el modelo puede mantener el estado de un repositorio completo entre turnos de una sesión de agente; el autor reporta que el 90 % de los tokens de prompt se sirven desde caché en este escenario.
- Despliegue en una única RTX 5090: el artefacto de 22,8 GB cabe en los 32 GB de VRAM de esa GPU, lo que permite ejecutar un modelo de 27B en cuantización de 4 bits sin infraestructura de servidor.
- Análisis de documentos largos y multimodal: combinando el contexto de 262.144 tokens con la torre de visión, se pueden procesar informes extensos con figuras, capturas o diapositivas intercaladas en una sola pasada.
- Investigación sobre decodificación especulativa: el artefacto permite comparar empíricamente las rutas MTP, DFlash2 y `--lm-head-draft` sobre los mismos pesos, útil para estudiar el compromiso entre tasa de aceptación y latencia.
- Asistentes de razonamiento con coste de tokens reducido: el ajuste "Swift" busca respuestas equivalentes con cadenas de pensamiento más cortas, lo que reduce el gasto en tokens de salida en despliegues con facturación por token (las cifras concretas de UkisAI no están verificadas por el autor del artefacto).
- Reproducción y validación de cuantizaciones NVFP4/FP8: al importar los pesos bit-exactos desde el checkpoint de UkisAI y seguir el mapeo de NVIDIA, sirve como referencia para verificar que una conversión a formato propio no altera los tensores de los linear del transformer.
- Punto de partida para reempaquetados propios: el informe de conversión por tensor incluido en el repositorio documenta cómo se trató cada objeto de peso, lo que facilita adaptar la receta a otros motores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este artefacto en la información disponible. Las únicas cifras aportadas son comparativas entre motores, medidas según el autor sobre el artefacto oficial de 27B de NInfer y no sobre este fichero concreto:

| Metrica | Valor |
|---|---|
| Tokens de prompt servidos desde cache de prefijo (repeticion de codificacion agentica, 27B) | 90 % |
| Tiempo hasta el primer token (Infernix vs. NInfer) | Aproximadamente la mitad del tiempo medio de NInfer |
| Velocidad de prefill de prompts largos (Infernix vs. NInfer) | 1,3-1,5x mas rapido |
| Calidad | Igual segun el autor |
| Benchmarks estandar de capacidad (razonamiento, codigo, matematicas, vision) | No publicados en la informacion disponible |

## Requisitos de hardware

- Artefacto construido específicamente para NVIDIA RTX 5090 (sm_120a, arquitectura Blackwell de consumo) y para los kernels NVFP4 W4A4, que requieren hardware Blackwell.
- VRAM estimada para inferencia: 22,8 GB solo de pesos; con los 32 GB de la RTX 5090 quedan aproximadamente 9 GB para cache KV, activaciones y buffers, lo que limita el contexto máximo práctico a pesar de los 262.144 tokens declarados.
- No hay datos publicados de consumo de VRAM por cuantización alternativa, ni versiones GGUF/AWQ/GPTQ de este artefacto.
- GPU recomendadas: RTX 5090 (objetivo declarado). Otras GPUs Blackwell (por ejemplo, serie B200/B100 para NVFP4) serían compatibles a nivel de precisión, pero no están validadas en la información disponible.
- GPUs sin soporte FP4 nativo (Ampere, Ada, Hopper) no pueden ejecutar las rutas W4A4 NVFP4 tal cual.
- Opciones de despliegue: Infernix (recomendado por el autor) y NInfer; también funciona con el fork ninfer-custom. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput absolutos: no disponibles. Solo se documentan mejoras relativas de Infernix frente a NInfer (1,3-1,5x en prefill de prompts largos y aproximadamente la mitad del tiempo al primer token).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Notas |
|---|---|---|---|---|---|
| wallawalla47/Swift-Qwen3.8-27B-NVFP4-NInferV3 | 27B | 262.144 | NVFP4/FP8 mixto, fichero `.ninfer` | swift-open-license-1.0 | Incluye DFlash2, MTP y cabeza de propuesta para decodificacion especulativa |
| ukisai/Swift-Qwen3.8-27B-NVFP4 | 27B | 262.144 (heredado, no confirmado en la informacion disponible) | NVFP4/FP8 (NVIDIA Model Optimizer) | no disponible | Modelo base directo; el artefacto NInfer importa sus pesos bit-exactos |
| nvidia/Qwen3.8-27B-NVFP4 | 27B | no disponible | NVFP4/FP8 | no disponible | Referencia de mapeo de precision seguida por el artefacto |
| Qwen3.8-27B (original) | 27B | no disponible | BF16 | Apache 2.0 (segun el artefacto) | Punto de partida no ajustado ni cuantizado |
| Wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-NInferV3 | 27B | no disponible | NVFP4/FP8, `.ninfer` | no disponible | Artefacto del mismo autor sobre el modelo de NVIDIA, sin el ajuste "Swift" |
| Wallawalla47/Swift-1.5-Qwen3.8-Flash-Next-NVFP4-Dense8-Infernix | no disponible | no disponible | NVFP4, formato Infernix | no disponible | Variante "Flash-Next"; ejecutable en el mismo motor |

No se dispone de comparativas de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El propio autor declara que el artefacto, su conversión y buena parte de la model card se hicieron con IA (mayoritariamente Claude Opus 5.5), que es trabajo de hobby y que "probablemente no sea ni completo ni totalmente exacto".
- No hay benchmarks publicados de capacidades (razonamiento, código, matemáticas, visión) para este artefacto; las afirmaciones sobre eficiencia de razonamiento del ajuste "Swift" provienen de UkisAI y no han sido verificadas por el autor del artefacto.
- Riesgo de alucinación: no cuantificado en la información disponible; se aplican los riesgos habituales de un modelo de 27B cuantizado a 4 bits sin evaluación publicada.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe ni calidad por idioma.
- La cuantización agresiva a 4 bits (W4A4 NVFP4) puede degradar capacidades respecto al modelo en BF16; no se documenta ninguna evaluación de degradación.
- El contexto nativo de 262.144 tokens no es alcanzable en la práctica en una RTX 5090 de 32 GB con 22,8 GB de pesos, salvo con gestión muy agresiva de la cache KV.
- Compatibilidad de motor muy restringida: requiere Infernix, NInfer o ninfer-custom; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, ni exportación a GGUF.
- Licencia `other` con nombre `swift-open-license-1.0`: los términos concretos no están detallados en la información proporcionada. Es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier uso comercial. Los componentes base Qwen3.8-27B y DFlash2 están bajo Apache 2.0.
- El repositorio registra 0 descargas y 0 likes, sin evidencia de validación por parte de terceros.
- Los componentes de decodificación especulativa (DFlash2, cabeza de propuesta) son añadidos por el autor y no forman parte del modelo base; su comportamiento puede variar según el motor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wallawalla47/Swift-Qwen3.8-27B-NVFP4-NInferV3
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-NVFP4
- Modelo base en BF16 (Qwen3.8-27B de UkisAI): https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Referencia de cuantizacion de NVIDIA: https://huggingface.co/nvidia/Qwen3.8-27B-NVFP4
- Artefacto analogo del mismo autor: https://huggingface.co/Wallawalla47/Qwen3.8-27B-NVIDIA-NVFP4-NInferV3
- Variante Flash-Next: https://huggingface.co/Wallawalla47/Swift-1.5-Qwen3.8-Flash-Next-NVFP4-Dense8-Infernix
- Motor Infernix (recomendado): https://github.com/Wallawalla47/Infernix
- Benchmarks de Infernix frente a NInfer: https://github.com/Wallawalla47/Infernix#qwen38-27b-infernix-vs-ninfer
- Recetario de conversion: https://github.com/Wallawalla47/Infernix/blob/main/tools/convert/official_recipes.py
- Motor NInfer: https://github.com/Neroued/ninfer
- Fork ninfer-custom: https://github.com/Wallawalla47/ninfer-custom
