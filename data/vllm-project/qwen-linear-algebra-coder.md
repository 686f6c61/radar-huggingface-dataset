# vllm-project/qwen-linear-algebra-coder

## Resumen

qwen-linear-algebra-coder es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen3-1.7B, especializado en generar codigo Python —principalmente con NumPy— que resuelve problemas de algebra lineal descritos en lenguaje natural. El desarrollo original corresponde al usuario premjatin, y esta copia concreta la mantiene el proyecto vLLM en su organizacion de HuggingFace como checkpoint de uso interno en su integracion continua (CI), con el objetivo de reducir el riesgo de suministro al no depender de una cuenta personal.

El modelo no introduce una arquitectura nueva: hereda la de Qwen3-1.7B (transformer decoder-only de 1.700 millones de parametros) y anade un adaptador de rango 16 sobre los modulos de atencion y MLP. Su proposito es acotado y practico: convertir enunciados de algebra lineal (valores propios, descomposiciones, sistemas de ecuaciones, inversas de matrices, etc.) en scripts ejecutables de Python, lo que lo hace util como componente de asistentes de codigo cientifico o de pipelines de generacion de codigo verificable.

Es relevante ahora por su caracter de ejemplo de especializacion ligera y de bajo coste: un adaptador de apenas 0,1 GB sobre un modelo pequeno permite obtener un comportamiento muy focalizado sin reentrenar el modelo completo. Ademas, su presencia en la organizacion vllm-project lo vincula a las pruebas de compatibilidad de vLLM con adaptadores PEFT, lo que interesa a quienes despliegan LoRA en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA (PEFT) |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B); el adaptador LoRA se suma sobre esa base |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-1.7B; no especificada en la model card) |
| Tipos de cuantizacion | 4 bits (bitsandbytes, ejemplo oficial); bfloat16 en el modelo base; otras no documentadas |
| Idiomas soportados | Ingles (enunciados) y Python (codigo) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA PEFT); requiere el modelo base Qwen/Qwen3-1.7B |
| Rango LoRA | r=16, alpha=32, dropout=0,05 |
| Modulos objetivo | down_proj, k_proj, v_proj, gate_proj, up_proj, q_proj, o_proj |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B, un transformer decoder-only con atencion por cabezas y capas MLP con activacion tipo SwiGLU (proyecciones gate/up/down). Sobre el se aplica un adaptador LoRA de rango 16 y alpha 32 con dropout 0,05, aplicado a las proyecciones de atencion (q, k, v, o) y a las tres proyecciones del bloque MLP, lo que cubre practicamente toda la ruta de computo relevante del transformer. El entrenamiento se realizo con la libreria PEFT en modalidad CAUSAL_LM.

El conjunto de datos de ajuste fino consiste en aproximadamente 10.000 pares problema-solucion centrados en algebra lineal, estructurados para ensenar al modelo a transformar un enunciado en un script Python. No se documentan en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO; tampoco se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). El formato de prompt empleado en el ejemplo oficial es un esquema con secciones `### INSTRUCTION`, `### PROBLEM` y `### PYTHON SOLUTION`, con generacion greedy (`do_sample=False`) y `max_new_tokens=256`.

## Capacidades

- Generacion de codigo Python para resolver problemas de algebra lineal descritos en lenguaje natural.
- Uso predominante de NumPy como libreria de referencia (sesgo explicito declarado por el autor).
- Traduccion de enunciados matematicos a scripts ejecutables con operaciones como calculo de valores y vectores propios, inversas, sistemas lineales y descomposiciones.
- Generacion de texto condicionada por prompt estructurado (formato instruction/problem/solution).
- Capacidad conversacional heredada del modelo base Qwen3-1.7B, aunque no es el foco del ajuste.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso explicito, vision ni audio.
- Capacidades multilingues limitadas en la practica a ingles para los enunciados y Python para el codigo.

## Casos de uso

- Asistente de codigo cientifico en notebooks: el modelo recibe un enunciado de algebra lineal y devuelve un script NumPy listo para ejecutar, lo que acelera prototipado en entornos de analisis de datos.
- Generacion de ejercicios resueltos para docencia: a partir de un enunciado, produce la solucion en codigo, util para crear material didactico verificable en asignaturas de algebra lineal.
- Componente de pipelines de CI para validar generacion de codigo: al ser un checkpoint usado por vLLM en sus pruebas, sirve como caso de prueba reproducible de inferencia con adaptadores LoRA y cuantizacion 4 bits.
- Preprocesado de problemas matematicos en sistemas de evaluacion automatica: convierte descripciones textuales en scripts ejecutables que luego se validan contra resultados esperados.
- Base para fine-tuning adicional: al ser un adaptador pequeno sobre Qwen3-1.7B, se puede reutilizar como punto de partida para dominios matematicos relacionados (calculo, estadistica) con coste de entrenamiento bajo.
- Despliegue en hardware de consumo: con cuantizacion 4 bits el conjunto base mas adaptador cabe en GPUs de gama media, lo que permite ejecutarlo localmente en flujos de asistencia a la programacion cientifica.
- Generacion de snippets para librerias de computacion numerica: util en documentacion tecnica o en sistemas de autocompletado especializados en NumPy.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base Qwen3-1.7B en bfloat16 requiere aproximadamente 3,4 GB solo para pesos; en cuantizacion 4 bits (bitsandbytes) baja a alrededor de 1 GB para pesos, mas overhead de activaciones y cache KV.
- El adaptador LoRA anade un coste marginal (repositorio de 0,1 GB, parametros de rango 16).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para 4 bits; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son viables, con holgura creciente.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas en cuantizacion 4 bits; en bfloat16 se recomienda 8 GB o mas.
- Opciones de despliegue: transformers + PEFT (ejemplo oficial), vLLM (el checkpoint se usa en su CI), y potencialmente llama.cpp u Ollama si se convierte el adaptador a GGUF, aunque esto no esta documentado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-linear-algebra-coder | 1,7 B (base) + LoRA | No disponible | Algebra lineal en Python | MIT | HuggingFace (vllm-project y premjatin) |
| Qwen/Qwen3-1.7B | 1,7 B | No disponible en esta ficha | Proposito general | No disponible en esta ficha | HuggingFace |
| Alternativas especializadas en codigo matematico | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Correccion del codigo: el autor advierte explicitamente de que el codigo generado no esta garantizado como correcto ni optimo; debe revisarse y probarse antes de usarlo en produccion.
- Alcance limitado: solo cubre los tipos de problemas presentes en su dataset de entrenamiento; puede fallar en problemas novedosos o de alta complejidad.
- Sesgo de libreria: entrenado principalmente con soluciones NumPy, favorecera esa libreria frente a alternativas como SymPy, SciPy o PyTorch.
- Idiomas: practicamente limitado a ingles para enunciados y Python para codigo; no se documenta soporte multilingue.
- Riesgo de alucinacion: como todo modelo generativo, puede producir codigo sintacticamente plausible pero matematicamente incorrecto.
- Dependencia del modelo base: requiere cargar Qwen/Qwen3-1.7B ademas del adaptador, lo que anade complejidad de despliegue.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-1.7B, cuya licencia no se detalla en esta ficha.
- Naturaleza de la copia: es una replica de un checkpoint de una cuenta personal mantenida por vLLM para su CI; no debe considerarse la version canonica ni la mas actualizada del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vllm-project/qwen-linear-algebra-coder
- Repositorio original: https://huggingface.co/premjatin/qwen-linear-algebra-coder
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
