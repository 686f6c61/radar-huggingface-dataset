# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-opd880-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-opd880-lora es un adaptador LoRA entrenado por el usuario uygarkurt sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. El objetivo del entrenamiento es especializar un modelo pequeno (0,5 mil millones de parametros) en tool calling estructurado y en la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta. El adaptador se ha entrenado en dos fases: 14.000 actualizaciones de supervised fine-tuning (SFT) seguidas de 880 actualizaciones de on-policy distillation (OPD) usando Qwen2.5-3B-Instruct como profesor congelado.

El modelo resuelve un problema concreto: los modelos de muy bajo parametraje suelen fallar al generar llamadas a funciones con formato correcto y, sobre todo, tienden a invocar herramientas irrelevantes en lugar de rechazar la peticion. Este adaptador intenta corregir ese comportamiento mediante destilacion sobre las propias respuestas del estudiante, guiadas por las probabilidades del profesor de 3B. Es relevante para quienes necesitan un modelo de tool calling extremadamente ligero desplegable en entornos con recursos minimos.

El repositorio contiene unicamente los pesos del adaptador (formato safetensors via PEFT), no el modelo completo, y debe cargarse sobre Qwen2.5-0.5B-Instruct. La licencia no esta declarada en la informacion disponible. El entrenamiento completo supuso 2,5 horas de computo en el bucle de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | 0,5 mil millones (modelo base); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la ficha (el modelo base Qwen2.5-0.5B-Instruct soporta contexto largo, pero no se confirma aqui) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion del base es independiente) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA adapter) |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Profesor (destilacion) | Qwen/Qwen2.5-3B-Instruct |
| Dataset de entrenamiento | uygarkurt/xlam-tool-calling-mixed |
| Libreria | peft, transformers |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. El entrenamiento consta de dos etapas. La primera es SFT con 14.000 actualizaciones (2,2 horas) sobre el dataset mixto de tool calling uygarkurt/xlam-tool-calling-mixed. La segunda es OPD (on-policy distillation) con 880 actualizaciones adicionales (0,3 horas), en la que el estudiante genera sus propias respuestas y aprende de las probabilidades por token del profesor congelado Qwen2.5-3B-Instruct. El adaptador final incorpora ambas fases; no es necesario cargar por separado el adaptador SFT previo.

La innovacion tecnica principal es el uso de OPD para reforzar el comportamiento de abstención (irrelevance) sobre un modelo muy pequeno, combinando datos de SFT con senales del profesor en distribuciones generadas por el propio estudiante. El dataset mezcla ejemplos de tool calling con casos en los que las herramientas ofrecidas no son relevantes. No se detalla la composicion exacta del dataset ni el numero de tokens de entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles.
- Tool calling / function calling estructurado (formato de llamada a funciones).
- Abtencion ante herramientas irrelevantes: el modelo puede rechazar invocar funciones cuando no aplican.
- Razonamiento basico y respuesta a instrucciones (evaluado con MMLU e IFEval, con resultados modestos).
- Matematicas basicas (MATH-500 evaluado, rendimiento limitado).
- Capacidades multilingues: solo ingles declarado.
- No se documentan capacidades de vision, audio, modo thinking explicito ni soporte de agentes multi-paso mas alla del tool calling de un turno.

## Casos de uso

- Enrutamiento de funciones en asistentes ligeros: el modelo decide que funcion invocar en un conjunto de herramientas ofrecidas y se abstiene cuando ninguna aplica, util para clasificadores de intencion en produccion con latencia minima.
- Despliegue en dispositivos con recursos limitados: al ser un adaptador sobre un base de 0,5B, puede ejecutarse en CPU o GPUs de gama baja para tareas de function calling simples.
- Preprocesado de peticiones en pipelines de agentes: actuar como primer filtro que decide si una consulta requiere una herramienta o puede responderse directamente, reduciendo costes en modelos mayores.
- Prototipado rapido de tool calling: servir como banco de pruebas para validar esquemas de funciones y formatos de llamada antes de escalar a modelos mayores.
- Investigacion en destilacion on-policy: ejemplo reproducible de como aplicar OPD con un profesor de 3B sobre un estudiante de 0,5B para mejorar la precision de llamadas y la abstención.
- Filtrado de relevancia de herramientas: usar las metricas de relevance/irrelevance para construir capas de guardia que eviten invocaciones erroneas en sistemas con muchas funciones disponibles.

## Benchmarks y rendimiento

Resultados publicados por el autor (porcentajes). La primera fila es el adaptador SFT inicial; la segunda es el adaptador final SFT + OPD.

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| SFT inicial | SFT 14.000 | 38,04% | 18,40% | 29,02% | 82,95% | 97,76% | 56,19% | 83,33% | 66,40% | 2,2 |
| SFT + OPD (este adaptador) | OPD 880 | 38,23% | 16,40% | 28,47% | 81,58% | 96,35% | 58,74% | 100,00% | 29,77% | 2,5 |

Notas del autor: xLAM ETC es exactitud exacta de llamada a herramienta; xLAM FNA es exactitud del nombre de funcion. Las puntuaciones xLAM usan el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 omitidos por el limite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a subconjuntos de relevancia seleccionados. IFEval usa exactitud estricta a nivel de prompt. Las evaluaciones xLAM usan scripts propios de Post-Training Lab.

Observacion: la fase OPD mejora Relevance (83,33% a 100,00%) y BFCL Single-turn FC (56,19% a 58,74%), pero degrada Irrelevance (66,40% a 29,77%), MATH-500 (18,40% a 16,40%) y ligeramente xLAM ETC y FNA. El autor no ofrece comparacion con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en fp16 ocupa aproximadamente 1 GB de pesos; el adaptador LoRA anade una cantidad marginal. En cuantizacion de 4 bits el base puede ocupar menos de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en CPU para inferencia de baja latencia.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 2 GB o mas de VRAM en fp16.
- Opciones de despliegue: transformers + peft (metodo nativo del adaptador), vLLM con soporte LoRA, llama.cpp/Ollama si se fusiona el adaptador con el base y se convierte a GGUF, TGI con adaptadores.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA) | 0,5B | no disponible | Si, especializado en abstención | no disponible | Hugging Face (adaptador) |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,5B | no disponible | Generico | no disponible | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct (profesor) | 3B | no disponible | Generico | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros adaptadores de tool calling en la informacion proporcionada. La comparativa se limita a los modelos base y profesor citados por el autor.

## Limitaciones y advertencias

- La metrica de Irrelevance cae del 66,40% al 29,77% tras OPD: el modelo final tiende a invocar herramientas incluso cuando no son relevantes, a pesar de que Relevance alcanza el 100%. Esto es un riesgo critico en produccion.
- MMLU (38,23%), MATH-500 (16,40%) e IFEval (28,47%) son bajos: el modelo no es adecuado para razonamiento general ni matematicas.
- Solo soporta ingles segun la model card; el uso en castellano no esta validado.
- Licencia no declarada: no se puede confirmar el uso comercial sin consultar al autor y a la licencia del modelo base Qwen2.5.
- El adaptador debe cargarse sobre Qwen2.5-0.5B-Instruct; no es un modelo autonomo.
- Riesgo de alucinacion en nombres de funciones o argumentos, aunque xLAM FNA es alto (96,35%).
- 743 ejemplos del test fueron omitidos por el limite de 640 tokens de prompt, lo que limita la evaluacion en contextos largos.
- Repositorio con 0 descargas y 0 likes: sin validacion externa de la comunidad.
- No se documentan sesgos especificos ni evaluaciones de seguridad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-opd880-lora
- Adaptador SFT previo: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor de destilacion: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio de entrenamiento: https://github.com/uygarkurt/post-training-lab
