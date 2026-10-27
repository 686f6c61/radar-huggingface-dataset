# tinyopsec/Qwen2.5-1.5B-Spanish-1.0-DPO-GGUF

## Resumen

El modelo `tinyopsec/Qwen2.5-1.5B-Spanish-1.0-DPO-GGUF` es una redistribución en formato GGUF del ajuste fino `Kukedlc/Qwen2.5-1.5B-Spanish-1.0-DPO`, que parte de `Qwen/Qwen2.5-1.5B-Instruct`. Lo publica el usuario tinyopsec y su aportación principal es empaquetar el modelo en cuantizaciones de llama.cpp listas para inferencia local. Se trata de un transformer decoder-only denso de 1.543.714.304 parámetros, con 32.768 tokens de contexto heredados de Qwen2.5 y licencia Apache 2.0.

El problema que aborda es el alineamiento en español mediante DPO sobre Big-Spanish-1.2M y pares Orca DPO, empaquetado para ejecutarse en CPU, GPU de consumo y entornos sin infraestructura dedicada. Frente al modelo base, busca respuestas más naturales en castellano; frente a alternativas propietarias, ofrece pesos abiertos y despliegue offline.

Es relevante por la combinación de tamaño reducido, contexto de 32K y formato GGUF, que permite prototipos y asistentes locales con requisitos de VRAM bajos. Ahora bien, el repositorio no incluye benchmarks ni validación comunitaria —0 descargas y 0 likes en la información consultada—, por lo que debe evaluarse antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5; Antbase indica ~33K) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Español (objetivo del DPO); otros idiomas de Qwen2.5 no verificados |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Modelo DPO de origen | Kukedlc/Qwen2.5-1.5B-Spanish-1.0-DPO |
| Tamano del repositorio | 15,3 GB |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only denso de la familia Qwen2.5. Según el repositorio de Qwen2.5, la serie se preentrenó con hasta 18T tokens. Sobre esa base, Kukedlc aplicó un ajuste DPO con Big-Spanish-1.2M y pares Orca DPO. No se especifican hiperparámetros, número de pasos, composición exacta del dataset ni si hubo RLHF adicional más allá del DPO.

tinyopsec convirtió los pesos a GGUF con llama.cpp y generó 13 variantes de cuantización, desde F16 hasta Q2_K. La ficha no documenta cambios arquitectónicos propios, decodificación especulativa ni técnicas de atención lineal; se trata de una cuantización estándar del modelo DPO, no de un modelo nuevo entrenado desde cero.

## Capacidades

- Generación de texto y diálogo conversacional en español, con ajuste DPO orientado a respuestas alineadas.
- Seguimiento de instrucciones y conversaciones multi-turno, heredado de Qwen2.5-1.5B-Instruct.
- Razonamiento básico y tareas de sentido común, limitado por el tamaño de 1,5B parámetros.
- Generación de código y matemáticas a nivel básico; no comparable con modelos de 7B o superiores.
- Manejo de contextos largos de hasta 32.768 tokens, útil para documentos y historiales extensos.
- Tool calling / function calling: no documentado en la información disponible.
- Agentes y razonamiento multi-paso: no documentado; el tamaño reducido limita la planificación compleja.
- Capacidades multilingües: el objetivo declarado es el español; el soporte de otros idiomas de Qwen2.5 no está verificado en esta ficha.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Atención al cliente automatizada en castellano: el modelo puede gestionar conversaciones multi-turno con un historial de hasta 32K tokens y ejecutarse en local para evitar enviar datos a la nube.
- Asistente personal offline: con la cuantización Q4_K_M ocupa alrededor de 1 GB de pesos y puede correr en un portátil con 8 GB de RAM, útil para borradores, resúmenes y respuestas rápidas.
- Generación de borradores de contenido y correo electrónico: el ajuste DPO sobre datos españoles busca un registro más natural que el modelo base, adecuado para marketing, soporte y documentación interna.
- Extracción y clasificación de información en documentos: con 32K de contexto puede procesar informes, contratos o artículos largos y devolver resúmenes o campos estructurados mediante prompts.
- RAG local con privacidad: integrado en un pipeline de recuperación con llama.cpp u Ollama, permite responder sobre bases documentales internas sin depender de APIs externas.
- Prototipado rápido de chatbots: al ser GGUF y Apache 2.0, se puede validar una idea en horas con LM Studio o koboldcpp antes de invertir en un modelo mayor.
- Educación y práctica de idiomas: puede mantener diálogos guiados en español y corregir respuestas, aunque requiere supervisión por su tendencia a la alucinación.
- Aumento de datos en español: puede generar variaciones de frases y ejemplos sintéticos para entrenar clasificadores o ajustar otros modelos, con revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones específicas en español para este modelo o para el DPO del que deriva.

## Requisitos de hardware

- VRAM estimada para inferencia, incluyendo overhead de runtime y caché KV para contextos moderados:

| Cuantización | Peso aproximado | VRAM recomendada |
|---|---|---|
| Q4_K_M | ~1,0 GB | 2-3 GB |
| Q5_K_M | ~1,2 GB | 2,5-3,5 GB |
| Q8_0 | ~1,7 GB | 3-4 GB |
| F16 | ~3,1 GB | 5-6 GB |

- A 32.768 tokens de contexto, la caché KV añade aproximadamente 1 GB adicional en F16; en cuantizaciones Q4/Q5 el incremento es menor, pero conviene reservar margen.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 o A100/H100 para servir muchas instancias. Para una sola instancia, una GTX 1650 de 4 GB puede ejecutar Q4_K_M.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU con 4 GB o más para Q4_K_M; también funciona en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa; para usarlos habría que convertir a safetensors o recurrir a un runtime compatible con GGUF.
- Latencia y throughput: no hay cifras oficiales. Como referencia orientativa, en CPU moderna puede generar del orden de 5-20 tokens/s; en GPU de consumo, decenas de tokens/s. La latencia real depende de la cuantización, el contexto y el backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinyopsec/Qwen2.5-1.5B-Spanish-1.0-DPO-GGUF | 1,54 B | 32K | Sin datos publicados | Apache 2.0 | GGUF en HuggingFace |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32K | Sin datos comparables en esta ficha | Apache 2.0 | Safetensors y GGUF |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32K | Sin datos comparables en esta ficha | Apache 2.0 | Safetensors y GGUF |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128K | Sin datos comparables en esta ficha | Licencia comunitaria Llama 3.2 | Safetensors y GGUF |

La comparación directa de calidad en español no está disponible. Frente a Qwen2.5-1.5B-Instruct, este modelo añade el ajuste DPO español, pero carece de evaluaciones publicadas. Frente a Qwen2.5-3B, ofrece menor huella de memoria a costa de menor capacidad. Frente a Llama-3.2-1B, la licencia Apache 2.0 es más permisiva para uso comercial, aunque el contexto es menor.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta una auditoría de sesgos. El DPO se entrenó con Big-Spanish-1.2M y pares Orca, por lo que puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: alto para un modelo de 1,5B, especialmente en preguntas factuales, matemáticas y citas. Requiere verificación humana en producción.
- Limitaciones de contexto: los 32K tokens son nominales; la calidad efectiva puede degradarse en contextos muy largos y con cuantizaciones agresivas.
- Limitaciones de idioma: el objetivo es el español; no hay evaluación de otros idiomas. El modelo base Qwen2.5 es multilingüe, pero el DPO puede haber reducido ese comportamiento.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve la licencia y los avisos aplicables. El modelo base Qwen2.5 también es Apache 2.0.
- Cuantización: Q2_K y Q3_K pueden degradar notablemente la calidad. Para uso real se recomienda Q4_K_M o superior.
- Falta de validación: 0 descargas, 0 likes y fechas de creación en 2026 en la información consultada; no hay evidencia comunitaria de calidad.
- Seguridad: no se documenta alineamiento de seguridad adicional. El DPO puede aumentar la verbosidad o la complacencia; conviene aplicar filtros y evaluaciones propias.
- Uso en dominios de alto riesgo: no apto para decisiones médicas, legales o financieras sin supervisión humana y validación específica.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/tinyopsec/Qwen2.5-1.5B-Spanish-1.0-DPO-GGUF
- Modelo DPO de origen: https://huggingface.co/Kukedlc/Qwen2.5-1.5B-Spanish-1.0-DPO
- GGUF del autor original: https://huggingface.co/Kukedlc/Qwen2.5-1.5B-Spanish-1.0-DPO-GGUF
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de Qwen2.5: https://github.com/mx4ai/qwen2.5
- Ficha en Antbase: https://antbase.ai/models/qwen2-5-1-5b-spanish-1-0-dpo
- Ficha en FriendliAI: https://friendli.ai/models/Kukedlc/Qwen2.5-1.5B-Spanish-1.0-DPO
- Discusión de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/Qwen2.5-1.5B-Spanish-1.0-DPO-GGUF/discussions
