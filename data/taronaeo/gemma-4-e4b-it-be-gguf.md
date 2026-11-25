# taronaeo/Gemma-4-E4B-IT-BE-GGUF

## Resumen

Gemma-4-E4B-IT-BE-GGUF es una cuantización en formato GGUF del modelo google/gemma-4-E4B-it, la variante instructiva de 4B efectivos de la familia Gemma 4 de Google DeepMind. El valor diferencial de esta publicación no reside en el modelo en sí, sino en el proceso de conversión: los pesos han sido sometidos a un *byte-swapping* (intercambio de orden de bytes) para poder ejecutarse en arquitecturas big-endian, concretamente los mainframes IBM Z (s390x) y LinuxONE de las generaciones z15, z16 y z17. Se trata, por tanto, de una compilación de nicho orientada a infraestructura empresarial tradicional.

El modelo base es multimodal (entrada de texto e imagen, con audio en las variantes E2B, E4B y 12B) y genera texto como salida. Según la model card, Gemma 4 mantiene soporte multilingüe en más de 140 idiomas y una ventana de contexto de hasta 256K tokens, con arquitecturas tanto densas como Mixture-of-Experts según el tamaño. La variante E4B pertenece a la gama pequeña, pensada para despliegue en entornos con recursos limitados.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas rutas prácticas para ejecutar modelos generativos modernos en mainframes IBM Z mediante llama.cpp; por otro, advierte de las limitaciones reales de este artefacto concreto (repo de 103,8 GB, ausencia de métricas publicadas, cero likes y metadatos de idioma no disponibles) frente al modelo original de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4; densa o MoE según variante, dato exacto de E4B no disponible) |
| Parametros totales | 7.518.069.290 (7,52B, según safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 256K tokens (familia Gemma 4, según model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0, BF16, mmproj F16 |
| Idiomas soportados | más de 140 idiomas (familia Gemma 4); lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (byte-swapped para big-endian / s390x) |

## Arquitectura y entrenamiento

El modelo subyacente pertenece a la familia Gemma 4 de Google DeepMind, que combina arquitecturas densas y Mixture-of-Experts en cinco tamaños (E2B, E4B, 12B, 26B A4B y 31B). La variante E4B es multimodal: acepta texto e imagen (y audio, según la model card, en E2B, E4B y 12B) y produce texto. Los detalles concretos sobre número de tokens de entrenamiento, composición del dataset y si hubo RLHF, DPO u otras etapas de alineación no están disponibles en la información proporcionada.

La innovación técnica de esta publicación es el *byte-swapping* de los tensores para que llama.cpp pueda operar en procesadores big-endian s390x. El repositorio incluye además un proyector multimodal (`mmproj-Gemma-4-E4B-IT-BE-F16.gguf`, 944,5 MB) necesario para las capacidades de visión. El autor remite a la guía oficial de compilación de llama.cpp para s390x como referencia de despliegue. No se documentan en la información disponible técnicas como decodificación especulativa o atención lineal específicas de esta conversión.

## Capacidades

- Generación de texto conversacional e instructivo (variante IT).
- Procesamiento de imagen como entrada (multimodal) mediante el proyector `mmproj` incluido.
- Procesamiento de audio como entrada, según la model card de la familia (E2B, E4B y 12B).
- Soporte multilingüe en más de 140 idiomas (familia Gemma 4).
- Razonamiento, código y matemáticas como tareas objetivo declaradas de la familia.
- Tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente.
- Ejecución en mainframes IBM Z y LinuxONE (z15, z16, z17) gracias a la conversión big-endian.

## Casos de uso

- Inferencia en mainframe IBM Z: el caso principal. Organizaciones con cargas críticas en s390x pueden ejecutar el modelo localmente con `llama-server -hf taronaeo/Gemma-4-E4B-IT-BE-GGUF:Q4_K_M`, sin sacar datos del perímetro del mainframe.
- Asistentes conversacionales internos en banca y seguros: el contexto de hasta 256K tokens permite mantener conversaciones multi-turno con documentación extensa, y el despliegue en z15/z16/z17 cumple requisitos de residencia de datos.
- Procesamiento de documentos con OCR asistido: combinando el modelo con el proyector multimodal se pueden interpretar imágenes escaneadas (facturas, formularios) y extraer texto estructurado dentro del propio mainframe.
- Traducción y atención multilingüe: con más de 140 idiomas declarados, es adecuado para entornos corporativos con clientes en múltiples regiones.
- Prototipado en entornos sin GPU: las cuantizaciones Q4_K_M (5,0 GB) y Q5_K_M (5,4 GB) permiten ejecución en CPU, lo que encaja con la filosofía de despliegue de IBM Z.
- Generación de borradores y resúmenes en pipelines batch: la variante Q8_0 (7,5 GB) o BF16 (14,0 GB) ofrece mayor fidelidad cuando el throughput no es crítico.
- Laboratorios de investigación en arquitecturas no x86: permite estudiar el comportamiento de modelos multimodales en big-endian y comparar rendimiento frente a little-endian.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q2_K ≈ 4,1 GB; Q3_K_M ≈ 4,5 GB; IQ4_XS ≈ 4,7 GB; Q4_K_M ≈ 5,0 GB; Q5_K_M ≈ 5,4 GB; Q6_K ≈ 5,8 GB; Q8_0 ≈ 7,5 GB; BF16 ≈ 14,0 GB. Añadir ~945 MB si se usa el proyector multimodal.
- GPU recomendadas: no aplica de forma directa; el destino principal son CPUs s390x de IBM Z (z15, z16, z17) y LinuxONE. En x86/ARM con llama.cpp, una RTX 4090 (24 GB) o una A100/H100 permiten cargar cualquier cuantización, incluida BF16.
- Cabe en GPU de consumo: sí. Cualquier GPU con 8 GB o más puede ejecutar Q4_K_M o Q5_K_M; con 16 GB se puede usar BF16.
- Opciones de despliegue: llama.cpp (compilación s390x documentada), `llama-server` con descarga directa desde Hugging Face. vLLM, TGI u Ollama no están confirmados para esta conversión big-endian.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-4-E4B-IT-BE-GGUF (este) | 7,52B | 256K (familia) | Sí (texto, imagen, audio) | Apache 2.0 | Byte-swapped para s390x |
| google/gemma-4-E4B-it (original) | 7,52B | 256K (familia) | Sí | Apache 2.0 | Pesos originales little-endian |
| Otras variantes Gemma 4 (E2B, 12B, 26B A4B, 31B) | 2B–31B | 256K (familia) | Sí | Apache 2.0 | Mayor tamaño, más recursos |

La comparación con modelos de otras familias (Llama, Qwen, Mistral) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de nicho: la conversión big-endian está pensada exclusivamente para s390x; en x86, ARM o GPU estándar conviene usar el modelo original de Google.
- Repositorio de 103,8 GB: incluye todas las cuantizaciones, lo que complica la descarga completa; conviene bajar solo el archivo necesario.
- Cero likes y metadatos de idioma no disponibles: señal de escasa validación comunitaria; conviene verificar la integridad de los pesos antes de usarlos en producción.
- Sin benchmarks publicados para esta conversión: el rendimiento real en z15/z16/z17 no está documentado.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de esta variante.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base.
- Licencia Apache 2.0 declarada, aunque el enlace apunta a la licencia específica de Gemma 4 de Google; conviene revisar los términos de uso comercial del modelo base.
- Tool calling y comportamiento agéntico no confirmados: no asumir su disponibilidad sin pruebas.
- El proyector multimodal es imprescindible para visión; sin él, el modelo solo procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taronaeo/Gemma-4-E4B-IT-BE-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Colección Gemma 4: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Guía de compilación de llama.cpp para s390x: https://github.com/ggml-org/llama.cpp/blob/master/docs/build-s390x.md
- Página de Gemma en DeepMind: https://deepmind.google/models/gemma/
