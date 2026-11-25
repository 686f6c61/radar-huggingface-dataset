# sukiiluilo/ScarletKc-2.0-exl3

## Resumen

ScarletKc-2.0-exl3 es la versión cuantizada con ExLlamaV3 del modelo ScarletKc-2.0, un modelo multimodal de 27B parámetros desarrollado por el autor independiente KC (scarletkc.com). Se trata de una arquitectura híbrida que combina atención lineal con atención completa, incorpora capacidades de visión (image-text-to-text) y soporta decodificación especulativa mediante cabezas MTP (multi-token prediction). El repositorio lo publica el usuario sukiiluilo como cuantización oficial del modelo base.

El valor principal de esta ficha es la metodología de cuantización: en lugar de repartir bits de forma uniforme entre tensores, el autor aplica un proceso de auto-calibración (generando datos de calibración con el propio modelo a 6.0 bpw) y medición de sensibilidad por tensor (inyectando ruido con la distribución del error real de cuantización y midiendo el impacto en KL-divergencia). Con esos datos, asigna más bits a los tensores que más reducen la divergencia total respecto al original en BF16.

El resultado son cinco variantes (3.0, 3.5, 4.0, 5.0 y 6.0 bpw), cada una en una rama del repositorio, con métricas de KLD y perplejidad publicadas frente al modelo original. Es relevante para quienes necesitan desplegar un modelo multimodal de 27B con contexto largo en GPUs de consumo o de gama profesional, manteniendo una fidelidad medible respecto al BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención lineal + atención completa; multimodal (visión); cabeza MTP para decodificación especulativa |
| Parametros totales | 27B (según model card del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32 768 tokens (valor de ejemplo en la configuración de TabbyAPI; el máximo real no se especifica) |
| Tipos de cuantizacion | ExLlamaV3 EXL3: 3.0, 3.5, 4.0, 5.0 y 6.0 bpw (cada una en una rama distinta) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato EXL3 de ExLlamaV3), con `quantization_config.json` por tensor |
| Tamano del repositorio | 88,2 GB (todas las ramas) |
| Tamano por variante (ficheros) | 6.0 bpw: 23,0 GB; 5.0 bpw: 20,0 GB; 4.0 bpw: 16,5 GB; 3.5 bpw: 15,0 GB; 3.0 bpw: 13,5 GB |
| VRAM de pesos por variante | 6.0 bpw: 18,2 GB; 5.0 bpw: 15,4 GB; 4.0 bpw: 12,3 GB; 3.5 bpw: 10,9 GB; 3.0 bpw: 9,4 GB |
| Bits de cabeza de salida | 8 (6.0/5.0 bpw), 6 (4.0/3.5/3.0 bpw) |
| Vision | sí, cuantizada a 6 bits |
| Cabeza MTP | 4 bits (6 bits en 5.0 y 6.0 bpw) |
| Libreria | exllamav3 (1.6.7 usada para cuantizar) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base ScarletKc-2.0 emplea una arquitectura transformer híbrida que mezcla capas de atención lineal con capas de atención completa, lo que permite manejar contextos largos con un coste computacional menor que un transformer de atención completa pura. Incorpora además un codificador visual para entrada de imágenes y cabezas MTP (multi-token prediction) que habilitan decodificación especulativa en inferencia. Los detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO y el proceso de alineación no están disponibles en la información proporcionada.

La innovación destacable de esta publicación no está en el entrenamiento del modelo base, sino en el proceso de cuantización. Se generan datos de calibración con el propio modelo a 6.0 bpw (conversaciones multi-turno con trazas de pensamiento, en varios idiomas y temas, usando su plantilla de chat) en lugar de corpus web genérico. Después se mide la sensibilidad de cada tensor inyectando ruido con la distribución del error real de cuantización (calibrado con la variante 2.0 bpw) sobre el BF16 y midiendo el impacto en KL-divergencia. Finalmente, se resuelve una asignación de bits por tensor que minimiza la divergencia total para cada presupuesto de tamaño. El autor reporta que esta asignación por sensibilidad reduce la KLD frente al reparto por defecto de ExLlamaV3 (que prioriza primero y último tensor) en aproximadamente un 5 % a 3.0, 4.0 y 5.0 bpw, y un 29 % a 3.5 bpw; además, la calibración propia aporta una mejora adicional (la KLD medida a 4.0 bpw es un 30 % inferior a la predicha por el optimizador).

## Capacidades

- Generación de texto conversacional multi-turno en chino e inglés.
- Razonamiento con modo de pensamiento (`<think>`), activable o desactivable mediante la variable de plantilla `enable_thinking`.
- Comprensión de imágenes (image-text-to-text): descripción de contenido visual, preguntas sobre imágenes.
- Tool calling / function calling: la model card indica que aproximadamente un 30 % de los prompts de evaluación en chino son conversaciones con llamadas a herramientas.
- Uso en agentes y razonamiento multi-paso (etiqueta `tool-use`, `reasoning`).
- Decodificación especulativa mediante la cabeza MTP integrada (modo `mtp` en TabbyAPI).
- Capacidades multilingües limitadas a chino e inglés.

## Casos de uso

- Asistente conversacional multi-turno en chino o inglés: el modelo mantiene contexto hasta 32 768 tokens (configurable), lo que permite conversaciones largas con historial extenso sin perder coherencia.
- Análisis de imágenes con preguntas en lenguaje natural: se puede enviar una imagen como data URL o URL y preguntar por su contenido; útil para moderación visual, accesibilidad o extracción de información de capturas y documentos.
- Automatización con llamadas a herramientas: al soportar tool calling y estar entrenado con conversaciones que incluyen invocaciones, se puede integrar en flujos donde el modelo decide qué función ejecutar (consultas a APIs, operaciones de sistema, recuperación de datos).
- Despliegue en GPU de consumo: la variante de 3.0 bpw ocupa 9,4 GB de pesos, lo que permite ejecutarla en GPUs de 12-16 GB de VRAM con cuantización de caché KV en Q4, dejando margen para el contexto y el codificador visual.
- Servicio local con API compatible con OpenAI: mediante TabbyAPI se expone un endpoint `/v1/chat/completions` que permite sustituir llamadas a APIs propietarias en aplicaciones existentes sin cambiar el código cliente.
- Generación de texto creativo y escritura en chino: la evaluación incluye pruebas específicas de escritura (ciencia ficción, poesía, reescritura de estilo, role-play); la variante de 5.0 bpw es la recomendada por el autor cuando la fidelidad en escritura es prioritaria.
- Investigación sobre cuantización: el repositorio incluye los datos de calibración, los planes de bits por tensor (`measurement/recipe_*.yaml`), los resultados de sensibilidad y los scripts (`scripts/quantize.sh`), lo que permite reproducir o estudiar el método.

## Benchmarks y rendimiento

El autor publica métricas de divergencia KL y perplejidad frente al modelo original en BF16, no benchmarks de tareas estándar (MMLU, HumanEval, GSM8K). Los resultados disponibles son:

| Version | KLD chino general | KLD escritura/dialogo chino | KLD literatura inglesa | Perplejidad chino general |
|---|---|---|---|---|
| BF16 (referencia) | — | — | — | 1,6248 |
| Límite de medición | 0,0006 | 0,0007 | 0,0009 | 1,6251 |
| 6.0 bpw | 0,0012 | 0,0016 | 0,0016 | 1,6230 |
| 5.0 bpw | 0,0022 | 0,0042 | 0,0038 | 1,6277 |
| 4.0 bpw | 0,0075 | 0,0164 | 0,0131 | 1,6349 |
| 3.5 bpw | 0,0149 | 0,0334 | 0,0245 | 1,6463 |
| 3.0 bpw | 0,0291 | 0,0686 | 0,0497 | 1,6685 |
| 2.0 bpw (media, no publicada) | 0,2243 | 0,3757 | 0,2099 | 2,0504 |

El conjunto de evaluación de chino general tiene unos 30 000 tokens de respuesta y aproximadamente un 30 % de diálogos con tool calling; el de escritura y diálogo consta de 10 preguntas (unos 4100 tokens); el de literatura inglesa, unos 20 000 tokens. El autor advierte que el conjunto de escritura, por ser pequeño y de muestreo, no es comparable en valor absoluto con los otros dos. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM de pesos por variante: 9,4 GB (3.0 bpw), 10,9 GB (3.5 bpw), 12,3 GB (4.0 bpw), 15,4 GB (5.0 bpw), 18,2 GB (6.0 bpw). Hay que sumar la caché KV, el codificador visual (6 bits) y la cabeza MTP (4-6 bits).
- El autor cuantizó con una sola RTX PRO 6000 (96 GB) y ExLlamaV3 1.6.7; para medir sensibilidad hay que cargar el BF16 completo (unos 70 GB de VRAM) con `--load-mode resident`.
- GPU recomendadas: RTX PRO 6000 o A100/H100 para trabajar con el BF16 y para las variantes de mayor tamaño con contexto largo; RTX 4090 (24 GB) para 4.0-6.0 bpw con contexto moderado; GPUs de 12-16 GB para 3.0-3.5 bpw con caché KV en Q4.
- Cabe en GPU de consumo: sí, las variantes de 3.0 y 3.5 bpw en GPUs de 12-16 GB, y la de 4.0 bpw en 16-24 GB.
- Opciones de despliegue: TabbyAPI con backend ExLlamaV3 (método documentado por el autor, con soporte de visión, modo razonamiento y borrador MTP); el formato EXL3 no es compatible con llama.cpp, Ollama ni vLLM de forma nativa.
- Latencia y throughput: no disponibles; el autor no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| ScarletKc-2.0-exl3 (esta ficha) | 27B | 32 768 (config. de ejemplo) | sí (visión) | Apache 2.0 | EXL3 / TabbyAPI |
| ScarletKc-2.0 (base) | 27B | no disponible | sí (visión) | Apache 2.0 | safetensors BF16 |
| Modelos de ~27B con visión y licencia permisiva | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de tareas que permitan una comparación de rendimiento con alternativas concretas; la única comparación documentada es la del propio proceso de cuantización frente al BF16 original.

## Limitaciones y advertencias

- Idiomas: solo chino e inglés; no se garantiza un rendimiento aceptable en castellano ni en otras lenguas.
- La model card no documenta sesgos conocidos del modelo base; al ser un modelo entrenado por un autor independiente, la composición del dataset y los sesgos asociados no son verificables con la información disponible.
- Riesgo de alucinación: no cuantificado; el autor no publica evaluaciones de factualidad.
- La cuantización introduce degradación medible: a 3.0 bpw la KLD en escritura/diálogo chino es de 0,0686, unas 40 veces la del límite de medición; en tareas de escritura creativa la pérdida es más notable que en preguntas generales.
- El conjunto de evaluación de escritura y diálogo es pequeño (10 preguntas) y generado por muestreo, por lo que sus valores absolutos no son comparables con los de los otros conjuntos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el `NOTICE` y la licencia del modelo base incluidos en el repositorio.
- El formato EXL3 requiere ExLlamaV3/TabbyAPI; no se puede cargar directamente en ecosistemas como transformers, llama.cpp u Ollama sin conversión.
- La configuración de ejemplo usa 32 768 tokens de contexto; el máximo real del modelo no se especifica y debe ajustarse según la VRAM disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación de la comunidad sobre la calidad de las cuantizaciones.
- La fecha de creación del repositorio (2026-11-24) es posterior a la fecha actual en muchos entornos; conviene verificar la integridad de los ficheros con `sha256sum -c SHA256SUMS` antes de usarlos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sukiiluilo/ScarletKc-2.0-exl3
- Modelo base: https://huggingface.co/ScarletKc/ScarletKc-2.0
- Sitio del autor del modelo base: https://scarletkc.com
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
