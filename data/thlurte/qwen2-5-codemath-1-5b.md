# thlurte/Qwen2.5-CodeMath-1.5B

## Resumen

Qwen2.5-CodeMath-1.5B es un modelo de lenguaje fusionado creado por el usuario independiente thlurte mediante la combinación de dos modelos base de la familia Qwen2.5: Qwen2.5-Coder-1.5B (especializado en generación de código) y Qwen2.5-Math-1.5B (especializado en razonamiento matemático). El objetivo es obtener un único modelo compacto de 1.500 millones de parámetros que conserve las capacidades de ambos dominios, facilitando su despliegue en entornos con recursos limitados.

La fusión se realiza con el método DARE-TIES (Drop And REscale with Task Vector Interference Elimination), una técnica de merge de modelos que elimina interferencias entre vectores de tarea y permite combinar modelos con pesos distintos. El modelo resultante hereda la arquitectura Transformer de Qwen2.5 y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. Es relevante porque demuestra cómo combinar especializaciones en un solo artefacto pequeño, útil para aplicaciones de edge computing o prototipado rápido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Qwen2.5) |
| Parametros totales | 1.543.298.048 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos originales en bfloat16) |
| Idiomas soportados | no disponible (hereda de Qwen2.5, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge con DARE-TIES, no de un entrenamiento desde cero. La configuración usa como ancla el modelo base Qwen/Qwen2.5-1.5B, y combina dos modelos especializados: Qwen2.5-Coder-1.5B con peso 0.60 y densidad 0.80, y Qwen2.5-Math-1.5B con peso 0.40 y densidad 0.80. El proceso aplica máscaras int8 para el cálculo de la fusión y mantiene precisión bfloat16. El tokenizador se toma de Qwen2.5-Coder-1.5B.

No se ha realizado ningún fine-tuning posterior ni entrenamiento adicional con datos propios. Las capacidades del modelo dependen enteramente de los modelos base, que fueron entrenados por Alibaba Cloud con datasets extensos de código y matemáticas respectivamente. Al ser un merge, no hay innovaciones arquitectónicas nuevas; la técnica DARE-TIES se encarga de resolver interferencias entre los vectores de tarea para preservar el rendimiento en ambos dominios.

## Capacidades

- Generacion de texto y conversacion: hereda la capacidad generativa de Qwen2.5, aunque no se ha verificado específicamente en este merge.
- Generacion de codigo: gracias al componente Qwen2.5-Coder, puede producir fragmentos de codigo en multiples lenguajes de programacion, completar funciones y explicar codigo.
- Razonamiento matematico: el componente Qwen2.5-Math aporta capacidad para resolver problemas aritmeticos, algebraicos y de razonamiento logico-matematico.
- Soporte de tool calling: no confirmado en la informacion disponible; los modelos base Qwen2.5 soportan function calling, pero el merge podria afectar a esta capacidad.
- Soporte de agentes y multi-step reasoning: no confirmado; depende de la integridad de los modelos base.
- Capacidades multilingues: no confirmado, aunque Qwen2.5 es multilingue, el tokenizador de Coder puede limitar algunos idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente de programacion con soporte matematico: el modelo puede ayudar a escribir codigo que requiera calculos complejos, como algoritmos numericos, simulaciones o procesamiento de datos, combinando sintaxis de programacion con razonamiento matematico.
- Tutoria educativa en STEM: puede explicar conceptos de programacion y matematicas en un mismo contexto, ideal para plataformas de aprendizaje interactivo donde el estudiante alterna entre teoria matematica y ejercicios de codigo.
- Generacion de scripts de automatizacion con calculo: en entornos de DevOps o analisis de datos, puede generar scripts que incluyan formulas estadisticas o financieras, reduciendo la necesidad de consultar dos modelos distintos.
- Prototipado rapido en entornos con poca VRAM: al ser un modelo de 1.5B, cabe en GPUs de consumo (4-6 GB VRAM) y permite iterar sobre ideas de codigo y matematicas sin depender de servicios en la nube.
- Preprocesamiento de datos cientificos: puede transformar descripciones en lenguaje natural de formulas o algoritmos a codigo ejecutable, util en laboratorios de investigacion.
- Evaluacion de modelos pequenos: sirve como referencia para comparar el rendimiento de merges frente a modelos individuales de mismo tamano, ayudando a decidir si la fusion compensa frente a mantener dos modelos separados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo en particular. Se recomienda al usuario ejecutar sus propias evaluaciones antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en bfloat16 (1.543M parametros × 2 bytes). Con cuantizacion a 4 bits (GGUF Q4_K_M) se reduce a unos 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4060 o superiores. En CPU, puede ejecutarse con 8 GB de RAM usando llama.cpp.
- Compatibilidad con GPU de consumo: si, es un modelo disenado para edge y entornos modestos.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Transformers de HuggingFace, TGI (Text Generation Inference) y cualquier framework compatible con safetensors.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del backend. En una RTX 3090 se esperan decenas de tokens por segundo, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia |
|---|---|---|---|---|
| Qwen2.5-CodeMath-1.5B (este) | 1.5B | no disponible | Codigo + matematicas | Apache 2.0 |
| Qwen2.5-Coder-1.5B | 1.5B | 32K (segun Qwen) | Codigo | Apache 2.0 |
| Qwen2.5-Math-1.5B | 1.5B | 32K (segun Qwen) | Matematicas | Apache 2.0 |
| Qwen2.5-1.5B | 1.5B | 32K | General | Apache 2.0 |

La comparativa directa con otros merges no esta disponible. Frente a los modelos base individuales, este modelo intenta unificar ambos dominios, pero no hay datos que demuestren que supera a cada especialista en su tarea. La ventaja principal es la conveniencia de un solo modelo.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos de los modelos base de Qwen, que pueden reflejar sesgos de genero, culturales o linguisticos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion: al ser un modelo de 1.5B, es propenso a generar respuestas plausibles pero incorrectas, especialmente en tareas complejas de codigo o matematicas. Se recomienda verificacion humana.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto efectiva tras el merge; es posible que el contexto se reduzca o que el modelo degrade con secuencias largas.
- Limitaciones de idioma: el tokenizador proviene de Qwen2.5-Coder, que puede tener menor cobertura para idiomas distintos del ingles y el chino.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia.
- Caveat de produccion: al ser un modelo sin fine-tuning especifico y sin benchmarks publicados, no se recomienda su uso directo en sistemas criticos sin una evaluacion exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thlurte/Qwen2.5-CodeMath-1.5B
- Modelo base Qwen2.5-Coder-1.5B: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B
- Modelo base Qwen2.5-Math-1.5B: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Modelo base ancla Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Repositorio de mergekit (herramienta usada): https://github.com/arcee-ai/mergekit
