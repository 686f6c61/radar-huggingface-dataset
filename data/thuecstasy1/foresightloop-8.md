# thuEcstasy1/ForesightLoop-8

## Resumen

ForesightLoop-8 es un modelo de lenguaje base de tipo causal con arquitectura de transformer recurrente ("looped transformer"), desarrollado por thuEcstasy1 (Zhaofeng Sun) y publicado bajo licencia Apache-2.0. Cuenta con 596.143.587 parametros y emplea ocho bucles recurrentes paralelos junto con un mecanismo propio denominado Attention Residuals con atencion cruzada entre trayectorias. El modelo se entrena desde una inicializacion aleatoria comun (no es un fine-tune de Qwen3), aunque reutiliza la configuracion de backbone y el tokenizador de Qwen3-0.6B.

El modelo resuelve un problema de investigacion: explorar el escalado en profundidad mediante recurrencia en lugar de apilar capas densas. En lugar de un transformer convencional de 28 capas ejecutadas una sola vez, ForesightLoop-8 reutiliza un backbone compartido de 28 capas a traves de ocho ciclos de ejecucion paralelos, lo que incrementa el computo efectivo sin aumentar proporcionalmente el numero de parametros.

Es relevante ahora como checkpoint de investigacion reproducible: libera pesos en FP32, un codigo de referencia en PyTorch eager y validacion de integridad de los tensores exportados. No obstante, se trata de un modelo base sin alineamiento conversacional, entrenado con un presupuesto reducido de 6.000 millones de tokens, por lo que su calidad de texto es limitada y no esta pensado para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con backbone compartido de 28 capas y 8 bucles recurrentes paralelos; G-SWA (Global Sliding Window Attention) y Attention Residuals con atencion cruzada entre trayectorias |
| Parametros totales | 596.143.587 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens (longitud de secuencia de entrenamiento); ventana local privada de 64 tokens por bucle y KV global compartido del primer bucle |
| Tipos de cuantizacion | no disponible (solo se publican pesos en FP32) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (precision original FP32) |

## Arquitectura y entrenamiento

La arquitectura se basa en un backbone transformer compartido de 28 capas con dimension oculta de 1.024 y dimension de FFN de 3.072. La atencion emplea 16 cabezas de consulta y 8 cabezas KV con dimension de cabeza 128. La innovacion central es la ejecucion recurrente: el mismo backbone se evalua en ocho bucles paralelos, y cada bucle mas superficial recibe las salidas del ciclo de ejecucion anterior mediante enrutamiento con RMSNorm de origen y Attention Residuals. La atencion combina un KV global compartido del primer bucle (G-SWA) con ventanas locales privadas de 64 tokens por bucle.

El entrenamiento utilizo 6.000.082.944 tokens de FineWeb-Edu durante 45.777 actualizaciones, con longitud de secuencia de 1.024 y batch global de 128 secuencias. La inicializacion parte de una inicializacion aleatoria comun, no de pesos preentrenados de Qwen3, aunque la configuracion de backbone y el tokenizador siguen a Qwen3-0.6B (revision del tokenizador fijada en `c1899de289a04d12100db370d81485cdf75e47ca`). No se menciona RLHF, DPO ni ningun tipo de alineamiento posterior. El modelo requiere una implementacion propia (`foresightloop`) y no registra `AutoModelForCausalLM`, por lo que no es compatible de forma garantizada con pipelines genericos de Transformers.

## Capacidades

- Generacion de texto causal en ingles a partir de prefijos naturales (modelo base, sin plantilla de chat).
- Razonamiento de continuacion de texto y coherencia local en ventanas cortas de contexto (1.024 tokens).
- Conocimiento factual y de sentido comun limitado, evaluado en tareas de opcion multiple y eleccion de palabra.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso estructurado (sin alineamiento ni modo thinking).
- Capacidad multilingue practicamente nula: solo entrenado en ingles.
- No dispone de vision, audio ni otras modalidades.

## Casos de uso

- Investigacion en arquitecturas recurrentes: el modelo sirve como referencia para estudiar el escalado en profundidad mediante bucles recurrentes, comparando profundidades medidas de cuatro y ocho ciclos.
- Reproduccion de experimentos academicos: al liberar pesos FP32, codigo eager y validacion de integridad, permite replicar las metricas reportadas (WikiText-2, LAMBADA y media de siete tareas) en entornos controlados.
- Generacion de texto de dominio acotado en ingles: continuacion de fragmentos tecnicos o cientificos donde la ventana de 1.024 tokens sea suficiente.
- Prototipado de tecnicas de atencion: la combinacion de G-SWA y Attention Residuals puede evaluarse como modulo en pipelines de investigacion propios.
- Benchmarking de eficiencia: util para medir el coste de la recurrencia frente a transformers densos de parametros comparables en tareas de perplexidad.
- Educacion y divulgacion: ejemplo didactico de transformer recurrente con backbone compartido para cursos de arquitecturas de modelos de lenguaje.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---:|
| WikiText-2 word PPL (menor es mejor) | 35,55 |
| LAMBADA final-word PPL (menor es mejor) | 42,04 |
| Media de siete tareas (%) | 43,07 |

La media de siete tareas incluye MMLU (5-shot), HellaSwag, ARC-E, ARC-C, PIQA, WinoGrande y OpenBookQA (0-shot el resto). Las definiciones exactas de metrica y el alcance de los benchmarks se documentan en el repositorio de codigo. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 2,4 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda al menos 6-8 GB de VRAM.
- Al no publicarse pesos cuantizados, no hay estimaciones oficiales para FP16, INT8 o INT4; una conversion manual a FP16 reduciria los pesos a unos 1,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente por tamano; para experimentos de mayor batch se recomienda A100 o H100.
- Cabe en GPU consumer: si, dado el reducido numero de parametros.
- Opciones de despliegue: requiere la implementacion propia `foresightloop` (PyTorch eager); no se garantiza compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; la model card indica que la API publica no reproduce las mediciones optimizadas con CUDA Graph, FA4 y Triton del paper.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---:|---:|---|---|
| ForesightLoop-8 | 596 M | 1.024 | Apache-2.0 | Transformer recurrente de 8 bucles; solo ingles; base sin alinear |
| Qwen3-0.6B | 0,6 B (dato no confirmado en la informacion) | no disponible | no disponible | Referencia de backbone y tokenizador; pesos no reutilizados |
| Alternativas de ~0,6 B densas | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de resultados de benchmarks de modelos alternativos en la informacion proporcionada para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Entrenado con un presupuesto reducido de 6.000 millones de tokens; la calidad del texto puede ser inconsistente o repetitiva.
- Puede generar afirmaciones no respaldadas y reflejar sesgos presentes en los datos de preentrenamiento (FineWeb-Edu).
- Modelo base sin alineamiento conversacional ni fine-tuning de seguridad; no debe usarse como asistente.
- Contexto limitado a 1.024 tokens, insuficiente para tareas de contexto largo.
- Solo soporta ingles.
- Requiere codigo propio y no es compatible de forma garantizada con pipelines genericos de Transformers (no registra `AutoModelForCausalLM`).
- La evidencia experimental cubre aproximadamente modelos densos de 0,6 B y profundidades recurrentes de cuatro y ocho; el escalado a arquitecturas mayores o MoE queda abierto.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de alineamiento y la baja calidad desaconsejan su uso en produccion.
- No se redistribuye el corpus de preentrenamiento ni los estados del optimizador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thuEcstasy1/ForesightLoop-8
- Repositorio de codigo: https://github.com/thuEcstasy/ForesightLoop
- Perfil del autor en Hugging Face: https://huggingface.co/thuEcstasy1
