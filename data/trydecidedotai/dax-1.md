# trydecidedotai/Dax-1

## Resumen

DAX-1 es un modelo de lenguaje especializado en la edición de hojas de cálculo y, en particular, en la generación de fórmulas DAX (Data Analysis Expressions) para Power BI y Analysis Services. Ha sido desarrollado por Decide (trydecide.ai) como su modelo insignia para operaciones recurrentes de hojas de cálculo, con un enfoque en precisión, eficiencia de costes y baja latencia. Se distribuye como un fine-tune del modelo base Qwen/Qwen3-14B, cuantizado en formato GGUF para su uso con llama.cpp.

El modelo se presenta como una alternativa mucho más económica y rápida que los modelos propietarios de gran tamaño: según los datos publicados por Decide, DAX-1 es un 97 % más barato de ejecutar que Anthropic Fable 5 y cinco veces más rápido, logrando además una precisión del 91,7 % frente al 58,3 % de Fable 5 en su benchmark interno DAXBench. Su relevancia actual radica en la creciente demanda de asistentes de IA especializados en tareas de análisis de datos y business intelligence, donde los modelos generalistas suelen fallar en la generación de código DAX correcto y compilable.

El acceso al modelo está restringido (gated) y requiere aceptar una licencia de investigación específica (dax-1-research-license). El repositorio contiene únicamente pesos en formato GGUF, con un tamaño total de 6,8 GB, y está orientado a su uso con la librería llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen/Qwen3-14B (transformer decoder-only, no se especifican detalles adicionales) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-14B soporta 32K, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | GGUF (cuantizaciones no especificadas en la informacion disponible) |
| Idiomas soportados | no disponible |
| Licencia | dax-1-research-license (acceso restringido, uso de investigacion) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion publica no detalla el proceso de entrenamiento de DAX-1. Se sabe que es un modelo post-entrenado a partir de Qwen/Qwen3-14B, lo que implica un fine-tune sobre el modelo base de 14B parametros. No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se utilizaron tecnicas como RLHF o DPO. El blog oficial menciona que el modelo esta "post-trained especificamente para edicion de hojas de calculo", pero no ofrece detalles tecnicos adicionales.

Dado que el repositorio contiene exclusivamente pesos GGUF, se infiere que el entrenamiento o la cuantizacion se realizo con herramientas compatibles con llama.cpp. Los tags indican soporte para "structured-output" y "tool-use", lo que sugiere que el fine-tune incluyo datos orientados a la generacion de salidas estructuradas y al uso de herramientas, probablemente para integrarse en flujos de trabajo de analisis de datos.

## Capacidades

- Generacion de formulas DAX correctas y compilables para Power BI y Analysis Services, con una precision reportada del 91,7 % en DAXBench.
- Edicion de hojas de calculo: el modelo esta disenado para tareas recurrentes de manipulacion de datos en entornos de spreadsheet.
- Soporte de tool-use y structured-output, lo que permite su integracion en pipelines que requieren salidas con formato definido (por ejemplo, JSON para llamadas a APIs).
- Capacidad conversacional: el modelo puede mantener dialogos multi-turno, aunque su especialidad es la generacion de codigo DAX.
- Eficiencia computacional: al ser un modelo de 14B cuantizado en GGUF, puede ejecutarse en hardware moderado con latencia reducida en comparacion con modelos propietarios de mayor tamano.
- Compatible con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue como servicio de inferencia.

## Casos de uso

- Generacion de medidas DAX para paneles de Power BI: un analista de datos puede solicitar al modelo una medida calculada (por ejemplo, ventas acumuladas o variacion interanual) y recibir una formula lista para pegar en el editor DAX.
- Automatizacion de informes recurrentes: DAX-1 puede integrarse en un pipeline que genere o actualice formulas DAX en modelos tabulares de Analysis Services, reduciendo el tiempo de desarrollo manual.
- Asistente de consultas ad-hoc: un usuario no experto en DAX puede describir en lenguaje natural el calculo deseado y obtener una formula correcta, validada contra DAXBench.
- Correccion y depuracion de formulas DAX existentes: el modelo puede analizar una formula que no compila y sugerir correcciones, gracias a su entrenamiento especifico en sintaxis DAX.
- Integracion en herramientas de BI de terceros: mediante su soporte de tool-use y structured-output, puede conectarse a aplicaciones como Excel o Power BI para generar codigo bajo demanda.
- Formacion y documentacion: el modelo puede servir como generador de ejemplos de DAX para cursos, documentacion tecnica o pruebas automatizadas de calidad de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible, salvo los datos proporcionados por Decide en su comunicacion publica:

- En DAXBench, DAX-1 alcanza un 91,7 % de precision en la generacion de formulas DAX correctas, frente al 58,3 % de Anthropic Fable 5.
- El coste de ejecucion es un 97 % inferior al de Fable 5, y la latencia es 5 veces menor.

No se dispone de resultados comparativos con otros modelos en benchmarks generales como MMLU, HumanEval o GSM8K. DAXBench es un benchmark especifico para DAX, desarrollado por la comunidad (Max Anatsko) y utilizado por Decide para sus evaluaciones.

## Requisitos de hardware

- Al ser un modelo de 14B parametros en formato GGUF, los requisitos de VRAM dependen de la cuantizacion elegida. Para una cuantizacion tipica Q4_K_M, se estima un uso de VRAM de aproximadamente 8-9 GB; para Q8, alrededor de 14-15 GB. Estas cifras son estimaciones orientativas basadas en el tamano del modelo y no estan confirmadas por el autor.
- GPU recomendadas: tarjetas con 8-16 GB de VRAM, como NVIDIA RTX 3060/3070/3080, RTX 4060/4070, o GPUs de datacenter como A10 o A100 (para despliegues de mayor concurrencia).
- Es posible ejecutar el modelo en CPU con llama.cpp, aunque con mayor latencia; se recomienda GPU para uso interactivo.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si se convierten los pesos a formato compatible), o servidores compatibles con endpoints GGUF.
- No se proporcionan datos de latencia o throughput especificos; la afirmacion de "5 veces mas rapido que Fable 5" es relativa y no cuantifica valores absolutos.

## Comparativa con modelos similares

No se dispone de una comparativa sistematica con otros modelos de la misma categoria (modelos especializados en DAX o en hojas de calculo). La unica comparacion publicada es con Anthropic Fable 5, un modelo propietario de gran tamano, en la que DAX-1 muestra ventajas en precision, coste y velocidad. No se conocen otros modelos open source especificamente entrenados para DAX con los que comparar parametros, contexto o licencia.

## Limitaciones y advertencias

- Licencia de investigacion: el modelo se distribuye bajo la licencia "dax-1-research-license", que restringe su uso a fines de investigacion. No se permite su uso comercial sin autorizacion explicita de Decide.
- Acceso restringido: el repositorio es gated; es necesario solicitar acceso y aceptar las condiciones en HuggingFace.
- Especializacion limitada: el modelo esta optimizado para DAX y hojas de calculo; su rendimiento en tareas generales de generacion de texto o codigo fuera de este dominio no esta evaluado y probablemente sea inferior al de modelos generalistas de su tamano.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar formulas que parecen correctas pero no compilan o producen resultados incorrectos. Se recomienda validar siempre la salida en un entorno de pruebas.
- Idiomas: no se ha especificado que idiomas soporta; es probable que el entrenamiento se haya realizado principalmente en ingles, dado el contexto de Power BI y DAX.
- Sin informacion sobre sesgos: no se han publicado estudios de sesgos o comportamientos problematicos.
- Dependencia del modelo base: al ser un fine-tune de Qwen3-14B, hereda las limitaciones de ese modelo, incluyendo posibles sesgos y limitaciones de conocimiento factual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/trydecidedotai/Dax-1
- Blog de presentacion: https://www.trydecide.ai/blog/introducing-dax-1-efficient-executable-spreadsheet-editing
- Anuncio en X (Twitter) con enlace al technical report: https://x.com/trydecideAI/status/2093326742215659874
- DAXBench (benchmark de DAX): https://www.daxbench.com/
- Blog de Max Anatsko sobre evaluacion de 70 modelos en DAX: https://www.maxanatsko.com/blog/i-tested-70-ai-models-on-dax-heres-what-actually-works
