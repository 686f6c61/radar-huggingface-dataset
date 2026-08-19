# ssurface/cot-dialect-math-olmo3-7b-think-grpo-cf-s1337-l5

## Resumen

El modelo `ssurface/cot-dialect-math-olmo3-7b-think-grpo-cf-s1337-l5` es un adaptador LoRA (PEFT) diseñado para modificar el modelo base `allenai/Olmo-3-7B-Think` con el objetivo de que razone a un nivel de compresión de cadena de pensamiento (CoT) denominado L5, que corresponde a una expresión colapsada en un único paso. Desarrollado por el usuario ssurface (Anatolii Frolov), este adaptador forma parte de una línea de investigación sobre "dialectos de compresión de CoT", donde se entrena al modelo para producir razonamientos extremadamente condensados en problemas matemáticos.

El adaptador se entrena mediante GRPO (Group Relative Policy Optimization) sobre un modelo SFT previo que ya había sido ajustado para el mismo nivel de compresión. El resultado reportado es una precisión del 61,6% en el conjunto de evaluación MATH-500, con decodificación greedy y sin autoconsistencia. La relevancia de este modelo reside en explorar si los modelos de razonamiento pueden mantener un rendimiento aceptable cuando se les fuerza a generar cadenas de pensamiento mucho más cortas, lo que tiene implicaciones para la eficiencia computacional en inferencia.

La arquitectura subyacente es la del modelo base Olmo-3-7B-Think, un transformer de 7 mil millones de parámetros, sobre el que se aplica un adaptador LoRA de rango 16. El modelo está licenciado bajo Apache 2.0 y solo soporta el idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: Olmo-3-7B-Think) + adaptador LoRA (r=16, alpha=32) |
| Parametros totales | 7B (modelo base) + adaptador LoRA (parametros del adaptador no especificados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no se especifica en la informacion; el modelo base Olmo-3 soporta contexto largo, pero no se indica el valor exacto) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors sin cuantizacion) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre `allenai/Olmo-3-7B-Think`, un transformer autoregresivo de 7B parametros desarrollado por el AI2 (Allen Institute for AI) como parte de la familia Olmo 3. El adaptador se entrena en dos fases: primero se realiza un ajuste fino supervisado (SFT) sobre un conjunto de problemas de entrenamiento MATH re-expresados a nivel de compresion L5 por un modelo profesor, y posteriormente se aplica GRPO sobre el modelo SFT fusionado. El entrenamiento GRPO utiliza el `trl.GRPOTrainer` de la libreria `transformers` con atencion `sdpa`, una recompensa combinada de correccion (que pondera segun el numero de pasos de la solucion dorada) y formato (exigiendo una unica respuesta con bloque `thinking... response` y el resultado en `#### <answer>`), y una perdida tipo `dapo` con coeficiente KL de 0.04. Se generan 8 muestras por prompt, con un batch de 32 y acumulacion de gradientes de 2, y un maximo de 256 tokens de completacion. El entrenamiento se realizo en una unica GPU NVIDIA A100 de 80GB.

Una innovacion destacable es la verificacion de que las matrices `lora_B` del adaptador no sean nulas, ya que en experimentos previos con kernels fusionados se obtuvieron adaptadores inertes. Todos los adaptadores publicados pasaron esta comprobacion.

## Capacidades

- Razonamiento matematico: el modelo esta especializado en resolver problemas de matematicas (tipo word problems) generando una cadena de pensamiento comprimida a nivel L5, es decir, una expresion unica y colapsada.
- Generacion de texto: como adaptador sobre un modelo de lenguaje generico, conserva la capacidad de generar texto, aunque su entrenamiento se ha centrado exclusivamente en tareas matematicas.
- Compresion de CoT: capacidad de producir razonamientos extremadamente condensados, lo que reduce el numero de tokens generados en inferencia.
- No se mencionan capacidades de tool calling, funciones, agentes, vision ni audio en la informacion disponible.
- Multilingue: solo ingles, segun la etiqueta de idioma.

## Casos de uso

- Investigacion en compresion de cadenas de pensamiento: este adaptador es una herramienta para estudiar como afecta la compresion extrema del razonamiento a la precision en tareas matematicas, util en entornos academicos o de I+D.
- Evaluacion de modelos de razonamiento: puede emplearse como referencia para comparar el rendimiento de modelos con CoT estandar frente a CoT comprimido en benchmarks como MATH-500.
- Generacion de soluciones matematicas concisas: en contextos donde se requiera una respuesta breve y directa a problemas matematicos, el modelo puede generar la solucion final sin pasos intermedios extensos.
- Optimizacion de costes de inferencia: al producir menos tokens de razonamiento, el modelo reduce el coste computacional por peticion en comparacion con modelos que generan CoT largas, aunque a costa de precision.
- Pruebas de robustez: permite analizar la degradacion del rendimiento cuando se fuerza una compresion agresiva del razonamiento, informacion util para disenar sistemas mas eficientes.
- Desarrollo de adaptadores especializados: sirve como ejemplo de como aplicar GRPO sobre un modelo SFT para ajustar el nivel de compresion del CoT, replicable en otros dominios.

## Benchmarks y rendimiento

Segun los datos declarados por el autor en la model card, el adaptador obtiene los siguientes resultados:

| Benchmark | Metrica | Resultado |
|---|---|---|
| MATH-500 (test, n=500) | Accuracy (exact match) | 61,6% |

Condiciones de evaluacion: decodificacion greedy, single-turn, sin ejemplos (no exemplars) y sin autoconsistencia. La puntuacion se realizo con un grader especifico que normaliza formas equivalentes (por ejemplo, `\frac{14}{3}` se considera igual a `14/3`). No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- El modelo base Olmo-3-7B-Think tiene 7B parametros, por lo que en precision bf16 requiere aproximadamente 14 GB de VRAM solo para los pesos. Con el adaptador LoRA, la memoria adicional es minima.
- Para inferencia en bf16, se recomienda una GPU con al menos 16 GB de VRAM, como una NVIDIA RTX 4090, A100 40GB o superior.
- En cuantizacion (por ejemplo, 8 bits o 4 bits), podria ejecutarse en GPUs de consumo con 8-12 GB de VRAM, aunque no se han publicado archivos cuantizados para este adaptador especifico.
- El entrenamiento se realizo en una unica NVIDIA A100 80GB, lo que da una referencia para cargas de trabajo de entrenamiento o ajuste fino.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con `transformers` + `peft` en cualquier framework compatible (vLLM, TGI, etc.). Tambien es posible fusionar el adaptador en el modelo base y exportarlo a GGUF para su uso con llama.cpp u Ollama, aunque no se proporcionan instrucciones especificas para ello.
- Latencia y throughput: no se especifican en la informacion disponible, pero al generar cadenas de pensamiento muy cortas (nivel L5), el numero de tokens de salida es significativamente menor que en un modelo con CoT estandar, lo que reduce la latencia por peticion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos en las mismas condiciones de evaluacion (MATH-500 con CoT comprimido L5) para establecer una comparativa directa. El modelo base `allenai/Olmo-3-7B-Think` sin el adaptador podria servir como referencia, pero no se ha publicado su accuracy en MATH-500 en la informacion proporcionada. Otros adaptadores similares de la misma coleccion (por ejemplo, los de niveles L1 o L3) tampoco tienen resultados publicados aqui. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matematicos de tipo word problem; no es adecuado para otras tareas de razonamiento general sin un ajuste adicional.
- La precision disminuye con la dificultad del problema, siendo la caida mas pronunciada en los niveles de compresion mas altos (como este L5).
- El adaptador requiere cargar primero el modelo SFT `ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l5` y fusionarlo, antes de aplicar este adaptador GRPO. Cargarlo directamente sobre el modelo base no reproduce el rendimiento reportado.
- Los resultados provienen de una unica semilla (a menos que el nombre del repo indique lo contrario); diferencias de unos pocos puntos porcentuales pueden deberse al ruido estadistico (intervalo de confianza del 95% de aproximadamente ±4.4 puntos en n=500).
- No se han evaluado sesgos sociales o eticos; al ser un modelo de razonamiento matematico, el riesgo de alucinacion en respuestas numericas existe, especialmente en problemas fuera de su distribucion de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base Olmo-3-7B-Think, que tambien esta bajo Apache 2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-grpo-cf-s1337-l5
- Modelo base Olmo-3-7B-Think (referencia): https://huggingface.co/allenai/Olmo-3-7B-Instruct (pagina del modelo Instruct; el Think esta disponible en el mismo perfil)
- Paper de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Repositorio de entrenamiento open-instruct (scripts para Olmo 3): https://github.com/allenai/open-instruct/blob/main/scripts/train/olmo3/README.md
- Adaptador SFT previo mencionado en el README: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l5 (no verificado en la busqueda, pero citado en la model card)
