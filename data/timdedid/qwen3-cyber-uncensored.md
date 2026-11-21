# timdedid/qwen3-cyber-UNCENSORED

## Resumen

qwen3-cyber-UNCENSORED es un fine-tune comunitario del modelo Qwen3-1.7B de Alibaba, publicado por el usuario timdedid en Hugging Face. Se trata de una variante "abliterated" (es decir, con las capas de rechazo eliminadas mediante tecnicas de ablation de direcciones de activacion) empaquetada en formato GGUF con cuantizacion Q4_K_M, pensada para su uso con llama.cpp y Ollama. El modelo hereda la arquitectura transformer densa de Qwen3 y su ventana de contexto de 40.960 tokens.

El modelo resuelve un nicho concreto: ofrecer una version sin filtros de seguridad de un modelo pequeno (1.700 millones de parametros) para experimentacion local en hardware de consumo. No incluye safety tuning y el propio autor advierte de que puede generar contenido ofensivo, inexacto o danino. Su relevancia es limitada y muy especifica: sirve como banco de pruebas para investigacion sobre alineacion, para estudios de comportamiento de modelos abliterated y para despliegues locales donde se requiera el menor consumo de recursos posible.

Es importante senalar que el repositorio no incluye pesos en safetensors ni documentacion sobre el proceso de fine-tune, los datos utilizados o evaluaciones. La model card es minima y se limita a instrucciones de uso. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicacion reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parametros totales | 2.031.739.904 (~2,03 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3-1.7B, un transformer denso de la familia Qwen3 con atencion por grupos (GQA), normalizacion RMSNorm y embeddings rotatorios (RoPE). La ventana de contexto nativa es de 40.960 tokens. Sobre esta base, el autor ha aplicado una tecnica de abliteration: la eliminacion de las direcciones de activacion asociadas al rechazo de peticiones, un procedimiento que modifica los pesos para suprimir el comportamiento de negativa sin reentrenar desde cero.

No se dispone de informacion sobre el dataset de abliteration, el numero de tokens empleados, si hubo fases de SFT o DPO adicionales, ni sobre hiperparametros de entrenamiento. La model card no documenta el pipeline de fine-tune. Tampoco se indica si se preservaron las capacidades de razonamiento extendido (thinking mode) del Qwen3 original ni como afecto la abliteration a las capacidades generales del modelo. El unico artefacto publicado es un GGUF Q4_K_M de aproximadamente 1,36 GB, con la plantilla de chat ChatML de Qwen3 embebida y un Modelfile para Ollama que fija `num_ctx` a 16.384 tokens (la mitad del contexto nativo), temperatura 0,6, top_k 20 y top_p 0,95.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat ChatML embebida en el GGUF.
- Razonamiento basico y respuesta a preguntas, limitado por el tamano del modelo (1,7 B).
- Generacion de codigo y matematicas simples, con fiabilidad limitada por la escala.
- Sin filtros de rechazo: responde a peticiones que el Qwen3 original rechazaria.
- Soporte de tool calling: no documentado en la model card; no disponible como capacidad verificada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: solo ingles declarado; el Qwen3 base es multilingue, pero este fine-tune no lo garantiza.
- Vision y audio: no disponibles (modelo solo texto).
- Thinking mode: no se documenta si se preserva el modo de razonamiento extendido del Qwen3 original.

## Casos de uso

- Investigacion sobre alineacion y abliteration: el modelo permite estudiar como la eliminacion de direcciones de rechazo afecta al comportamiento, la coherencia y la calidad de las respuestas en un modelo pequeno, con un coste computacional minimo.
- Despliegue local en hardware de consumo: con 1,36 GB en Q4_K_M, cabe en cualquier GPU con 4 GB o mas de VRAM (o incluso en CPU), lo que permite experimentar con un LLM en portatiles y mini-PC sin GPU dedicada.
- Prototipado rapido de pipelines conversacionales: sirve para validar plantillas de chat, formatos de prompt y flujos de integracion con Ollama o llama.cpp antes de migrar a modelos mayores.
- Generacion de texto creativo sin restricciones: para proyectos de escritura donde se requiera explorar contenido que los modelos alineados rechazan, siempre dentro de un marco legal.
- Pruebas de robustez y red teaming: util como baseline "sin alinear" para comparar respuestas frente a modelos con safety tuning en evaluaciones de seguridad.
- Educacion y demostraciones: ejemplo didactico de cuantizacion GGUF, abliteration y despliegue con Ollama en un taller o clase sobre modelos open source.
- Generacion de datos sinteticos en ingles: para aumentar datasets de entrenamiento en tareas donde se necesita diversidad de respuestas sin filtros, con revision posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con Q4_K_M (el archivo pesa 1,36 GB mas overhead de contexto KV).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, incluidas las integradas con memoria unificada.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (via Modelfile incluido). No se ha publicado version para vLLM ni TGI (solo existe GGUF, no safetensors).
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1,7 B en Q4_K_M, se espera un throughput alto en GPU consumer, pero no hay mediciones publicadas.
- Nota: el Modelfile de Ollama fija `num_ctx` a 16.384 tokens, la mitad del contexto nativo de 40.960; para usar el contexto completo hay que modificar ese parametro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen3-cyber-UNCENSORED | ~2,03 B | 40.960 | Apache-2.0 | GGUF (Q4_K_M) | Abliterated, solo ingles, sin benchmarks |
| Qwen/Qwen3-1.7B | ~2,03 B | 40.960 | Apache-2.0 | safetensors, GGUF | Modelo base oficial, con safety tuning y benchmarks publicados |
| Llama 3.2 1B | ~1,2 B | 128.000 | Llama 3.2 Community License | safetensors, GGUF | Alternativa de Meta, multilingue, con restricciones de licencia |
| Gemma 3 1B | ~1 B | 32.000 | Gemma Terms of Use | safetensors, GGUF | Alternativa de Google, multilingue, con restricciones de licencia |

La comparacion directa mas relevante es con el Qwen3-1.7B original, del que este modelo es una derivacion: comparte arquitectura, tamano y contexto, pero pierde el safety tuning y no aporta evaluaciones. Frente a Llama 3.2 1B y Gemma 3 1B, la ventaja principal es la licencia Apache-2.0 (mas permisiva) y la desventaja es el soporte exclusivo de ingles y la ausencia de datos de rendimiento.

## Limitaciones y advertencias

- Ausencia total de safety tuning: el modelo puede generar contenido ofensivo, ilegal o danino; el autor lo advierte explicitamente.
- Riesgo elevado de alucinacion: con 1,7 B de parametros, la fiabilidad factual es baja, especialmente en tareas de conocimiento.
- Solo ingles declarado: no se garantiza el rendimiento multilingue del Qwen3 base.
- Sin benchmarks ni evaluacion: no hay datos que permitan comparar su calidad con el modelo base ni con alternativas.
- Proceso de abliteration no documentado: se desconoce que datos o metodos se usaron y como afecta a las capacidades generales.
- Licencia Apache-2.0: permite uso comercial, pero el contenido generado puede infringir otras normativas; la responsabilidad recae en el usuario.
- Sin soporte de vLLM ni TGI: al publicarse solo en GGUF, no se puede servir con los frameworks de alta concurrencia habituales sin conversion previa.
- Contexto efectivo reducido en Ollama: el Modelfile fija 16.384 tokens, la mitad del maximo nativo.
- Modelo sin validacion comunitaria: 0 descargas y 0 likes; no hay evidencia de uso en produccion.
- Proyecto no afiliado a Qwen ni Alibaba: es una redistribucion no oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/timdedid/qwen3-cyber-UNCENSORED
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Pagina del modelo en Ollama: https://ollama.com/timdedid/qwen3-1.7b-cyber
