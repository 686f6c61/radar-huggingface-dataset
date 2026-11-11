# thepytales/gemma-4-26b-a4b-lora-edition

## Resumen

Gemma 4 26B A4B – Lora Edition es una redistribución en formato GGUF del modelo google/gemma-4-26B-A4B-it, desarrollado originalmente por Google DeepMind. La publica el usuario thepytales (PyTales) como empaquetado listo para su uso en la aplicación Lora, con los pesos byte a byte idénticos a la fuente original ggml-org/gemma-4-26B-A4B-it-GGUF (commit 9cf8c8d). No se trata de un ajuste fino ni de una modificación de pesos: el autor declara explícitamente que las ponderaciones están sin cambios y que su aportación se limita a la selección de ficheros, la verificación mediante SHA-256 y el ajuste de contexto y plantilla para la app.

El modelo base es un Gemma 4 de 26B con arquitectura MoE (la nomenclatura A4B indica aproximadamente 4B de parámetros activos por token). El repositorio contiene 25.233.142.046 parámetros totales según los metadatos de safetensors, un fichero GGUF cuantizado a Q4_0 de 14,62 GB y un proyector multimodal Q8_0 de 806,4 MB, lo que confirma capacidad de visión. La longitud de contexto no se especifica en la información disponible.

Su relevancia práctica es doble: por un lado, ofrece una vía de despliegue local de un modelo multimodal MoE de 26B en hardware de consumo mediante cuantización Q4_0; por otro, sirve como ejemplo de redistribución verificable, ya que publica los hashes SHA-256 de cada fichero para que el usuario pueda comprobar la integridad frente al origen. La licencia declarada es Apache-2.0, con remisión a los avisos de licencia de Gemma 4 de Google incluidos en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (nomenclatura A4B: ~4B parámetros activos) |
| Parametros totales | 25.233.142.046 |
| Parametros activos | no disponible (la nomenclatura A4B sugiere ~4B, sin cifra oficial en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (texto), Q8_0 (proyector multimodal mmproj) |
| Idiomas soportados | de, en |
| Licencia | Apache-2.0 (con avisos de licencia Gemma 4 de Google en LICENSE) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base google/gemma-4-26B-A4B-it es un transformer con mezcla de expertos (MoE), tal como indica el sufijo A4B en su denominación, que en la convención de Google refleja el número de parámetros activos por token (aproximadamente 4B) frente a los 25,2B totales. Incluye un codificador visual, evidenciado por el fichero proyector mmproj en formato Q8_0, y está orientado a instrucciones (sufijo -it). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base.

Esta edición concreta no introduce ningún entrenamiento adicional: el autor afirma que los pesos son idénticos a los de ggml-org/gemma-4-26B-A4B-it-GGUF en el commit 9cf8c8d y publica los SHA-256 de ambos ficheros para verificación. La única adaptación es de configuración (contexto y plantilla de chat) para la aplicación Lora. No se documentan innovaciones técnicas propias de esta distribución.

## Capacidades

- Generación de texto conversacional en alemán e inglés, con formato de chat (tag conversational).
- Procesamiento de imágenes mediante el proyector multimodal mmproj-gemma-4-26B-A4B-it-Q8_0.gguf.
- Razonamiento e instrucciones generales heredados del modelo base -it de Google DeepMind.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su integración en despliegues con API compatible con OpenAI.
- Capacidad de ejecución local en CPU/GPU mediante el ecosistema GGUF (llama.cpp y derivados).
- No se documentan en la información disponible capacidades específicas de tool calling, agentes multi-paso, audio o modo thinking.

## Casos de uso

- Despliegue local de un asistente multimodal: el par GGUF Q4_0 + mmproj Q8_0 permite ejecutar un modelo de 26B con visión en una estación de trabajo, sin depender de APIs externas, usando llama.cpp o frontends compatibles.
- Aplicaciones de escritorio con la app Lora: el paquete está preconfigurado (contexto y plantilla) para esta aplicación concreta, lo que reduce el trabajo de integración para usuarios finales.
- Procesamiento de documentos con imágenes en inglés o alemán: extracción de información de capturas, formularios escaneados o gráficos combinando el codificador visual con la generación de texto.
- Asistencia conversacional en alemán: atención en idioma germano para tareas de soporte o generación de contenido, uno de los dos idiomas declarados.
- Verificación de cadena de suministro de modelos: los SHA-256 publicados permiten auditar que los pesos desplegados coinciden con el origen oficial, útil en entornos con requisitos de procedencia.
- Prototipado e investigación con MoE cuantizado: permite estudiar el comportamiento de un MoE de 25B con ~4B activos en hardware modesto, comparando latencia y calidad frente a modelos densos equivalentes.
- Inferencia en servidores con endpoints compatibles: el tag endpoints_compatible facilita montar un servicio HTTP local para pruebas de integración antes de pasar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el fichero de texto Q4_0: en torno a 15 GB solo para pesos; sumando caché KV y overhead, se recomienda un mínimo de 18-20 GB de VRAM para contexto moderado.
- El proyector multimodal Q8_0 añade 806,4 MB adicionales cuando se usa visión.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB, H100. Una RTX 4080 (16 GB) queda muy justa para el Q4_0 con contexto corto y sin visión.
- Cabe en GPU de consumo de 24 GB (4090, 3090) con margen limitado; en 16 GB solo con cuantizaciones más agresivas no incluidas en este repositorio.
- Opciones de despliegue: llama.cpp, Ollama (previa importación del GGUF), frontends compatibles con GGUF y servidores con endpoints compatibles con OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma 4 26B A4B – Lora Edition (esta ficha) | 25,2B totales / ~4B activos | no disponible | Apache-2.0 | GGUF Q4_0 + mmproj Q8_0 | Redistribución verificada de ggml-org, orientada a la app Lora |
| google/gemma-4-26B-A4B-it (base) | 25,2B totales / ~4B activos | no disponible | Apache-2.0 | safetensors (original) | Modelo oficial de Google DeepMind, multimodal, sin cuantizar |
| ggml-org/gemma-4-26B-A4B-it-GGUF | 25,2B totales / ~4B activos | no disponible | Apache-2.0 | GGUF | Fuente directa de los ficheros de esta edición |
| Otros MoE abiertos de tamaño similar | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

La diferencia entre esta edición y el GGUF de ggml-org es únicamente de empaquetado y configuración para la app Lora; los pesos son idénticos según los hashes publicados.

## Limitaciones y advertencias

- Solo se declaran los idiomas alemán e inglés; el rendimiento en castellano no está garantizado ni documentado.
- Al ser una redistribución sin modificación de pesos, hereda todos los sesgos y riesgos de alucinación del modelo base de Google, no evaluados en esta ficha.
- La licencia Apache-2.0 se acompaña de los avisos de licencia de Gemma 4 de Google; conviene revisar el texto de LICENSE antes de un uso comercial, ya que pueden aplicarse términos adicionales del licenciante original.
- El autor indica que Google DeepMind no ha revisado ni aprobado esta edición; la responsabilidad de uso recae en el usuario bajo la licencia del original.
- La cuantización Q4_0 introduce pérdida de calidad frente a los pesos originales en safetensors, especialmente en tareas de razonamiento y código.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar despliegues con ventanas largas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni benchmarks propios: la validación comunitaria es nula.
- El tamaño del fichero (14,62 GB) limita su uso a equipos con suficiente VRAM o RAM para inferencia en CPU, que será considerablemente más lenta.

## Enlaces

- Hugging Face: https://huggingface.co/thepytales/gemma-4-26b-a4b-lora-edition
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Fuente GGUF: https://huggingface.co/ggml-org/gemma-4-26B-A4B-it-GGUF (commit 9cf8c8d)
- Licencia Gemma 4 de Google: https://ai.google.dev/gemma/docs/gemma_4_license
