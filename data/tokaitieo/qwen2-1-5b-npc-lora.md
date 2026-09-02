# TokaiTieo/qwen2-1.5b-npc-lora

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) para el modelo Qwen2-1.5B-Instruct, desarrollado por el usuario TokaiTieo. El adaptador está diseñado para especializar el modelo base en la generación de diálogos para personajes no jugables (NPC), un caso de uso común en el desarrollo de videojuegos, simulaciones interactivas y entornos de rol.

El modelo se presenta como un adaptador PEFT (Parameter-Efficient Fine-Tuning) de 0.1 GB, lo que significa que no es un modelo completo sino un conjunto de pesos delta que deben combinarse con el modelo base Qwen2-1.5B-Instruct para funcionar. La ficha técnica del autor está prácticamente vacía: no se especifican datos de entrenamiento, hiperparámetros, evaluación ni licencia, lo que limita considerablemente la capacidad de evaluar su calidad y seguridad. A pesar de ello, la elección de Qwen2-1.5B-Instruct como base es razonable, ya que es un modelo compacto de 1.500 millones de parámetros con buen rendimiento para su tamaño y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) con adaptador LoRA |
| Parametros totales | no disponible (adaptador LoRA de 0.1 GB; base: 1.500 millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; el base admite cuantizacion) |
| Idiomas soportados | no disponible (el base soporta 27 idiomas ademas de ingles y chino) |
| Licencia | no disponible (el base es Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Qwen2, un transformer decoder con attention causal estandar, normalizacion RMSNorm, embeddings rotatorios (RoPE) y activacion SwiGLU. El modelo base Qwen2-1.5B-Instruct tiene 1.500 millones de parametros, 28 capas, 12 cabezas de atencion y un tamaño de embedding de 1.536, con una ventana de contexto de 32.768 tokens. La version Instruct fue ajustada con datos de instrucciones y preferencias humanas.

El adaptador LoRA fue entrenado con la libreria llama-factory y PEFT 0.18.1, lo que indica un ajuste de bajo rango sobre las matrices de proyeccion del transformer. Sin embargo, no se ha publicado informacion sobre el dataset utilizado, el numero de pasos de entrenamiento, el rango del adaptador, la tasa de aprendizaje ni el regimen de precision. Tampoco se indica si se aplicaron tecnicas como RLHF o DPO. Esta ausencia de documentacion es una limitacion significativa para reproducir el entrenamiento o evaluar su calidad.

## Capacidades

- Generacion de texto conversacional: el adaptador esta orientado a producir dialogos para NPC, por lo que deberia generar respuestas contextuales en formato conversacional.
- Razonamiento basico: hereda las capacidades del modelo base Qwen2-1.5B-Instruct, que incluyen razonamiento logico simple, respuesta a preguntas y seguimiento de instrucciones.
- Generacion de codigo: el modelo base tiene capacidades limitadas de generacion de codigo, que el adaptador puede conservar o modificar segun el dataset de entrenamiento.
- Soporte multilingue: el base fue entrenado en 27 idiomas adicionales al ingles y chino, pero no se sabe si el adaptador preserva estas capacidades.
- Tool calling: el modelo base Qwen2-1.5B-Instruct soporta function calling, pero no se ha verificado si el adaptador mantiene esta funcionalidad.
- Sin capacidades especiales: no hay evidencia de modo thinking, vision, audio ni otras modalidades.

## Casos de uso

- Dialogos de NPC en videojuegos: el adaptador puede generar respuestas contextuales para personajes no jugables en juegos de rol, aventuras graficas o mundos virtuales, permitiendo conversaciones mas variadas que los guiones fijos.
- Prototipado rapido de personajes: los desarrolladores pueden usar el adaptador para generar dialogos de prueba durante la fase de diseno narrativo, acelerando la iteracion sobre la personalidad y el tono de los personajes.
- Simulaciones de entrenamiento: en entornos de simulacion para formacion de personal (atencion al cliente, negociacion, etc.), el adaptador puede interpretar roles de interlocutor con un coste computacional reducido.
- Mundos persistentes en linea: integrado en servidores de juegos multijugador, puede generar respuestas dinamicas para NPC en funcion del historial de interacciones con los jugadores.
- Generacion de misiones y contenido narrativo: combinado con herramientas de generacion procedural, puede producir dialogos para misiones secundarias o eventos aleatorios.
- Investigacion academica: util como punto de partida para estudiar tecnicas de adaptacion de bajo rango en modelos pequenos para tareas conversacionales especificas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no ha proporcionado evaluaciones sobre MMLU, HumanEval, GSM8K ni ninguna otra metrica estandar. Tampoco se han comparado los resultados con el modelo base sin adaptar ni con otros adaptadores LoRA similares. Cualquier afirmacion sobre el rendimiento relativo seria especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2-1.5B-Instruct en precision fp16 ocupa aproximadamente 3 GB de VRAM. Con el adaptador LoRA anadido, el consumo adicional es minimo (inferior a 0.1 GB). En cuantizacion de 4 bits, el consumo se reduce a aproximadamente 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16 (GTX 1650, RTX 3050, etc.). Para cuantizacion de 4 bits, basta con 2 GB (incluso en CPU con suficiente RAM).
- Compatibilidad con consumer GPU: si, cabe en practicamente cualquier GPU de consumo actual, incluidas las integradas de gama alta con suficiente memoria compartida.
- Opciones de despliegue: al ser un adaptador PEFT, debe cargarse con transformers y peft en Python. Tambien puede convertirse a GGUF para usarse con llama.cpp u Ollama, aunque el proceso de conversion requiere combinar primero el adaptador con el modelo base.
- Latencia y throughput: no disponible. En una GPU moderna (RTX 3060 o superior), se espera una generacion de 20-40 tokens por segundo para un modelo de 1.5B en fp16, pero no hay datos medidos para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo |
|---|---|---|---|---|
| Qwen2-1.5B-Instruct (base) | 1.500 M | 32.768 | Apache 2.0 | Modelo completo |
| Este adaptador LoRA | 0.1 GB (delta) | 32.768 (heredado) | no disponible | Adaptador PEFT |
| Llama-3.2-1B-Instruct | 1.230 M | 128.000 | Llama 3.2 | Modelo completo |
| Gemma-2-2B | 2.600 M | 8.192 | Gemma | Modelo completo |

La comparativa directa con otros adaptadores LoRA para NPC no es posible por falta de informacion. Frente a modelos completos de tamano similar, el adaptador hereda las capacidades de Qwen2-1.5B-Instruct, que en benchmarks publicos supera a Llama-3.2-1B en varias tareas de razonamiento y codigo, aunque queda por detras de Gemma-2-2B en tamano y capacidad bruta. La ventaja del adaptador es su tamano reducido y la posibilidad de intercambiarlo sin sustituir el modelo base.

## Limitaciones y advertencias

- Documentacion inexistente: la model card no contiene informacion sobre el dataset, el proceso de entrenamiento, la evaluacion ni la licencia. Esto impide verificar la calidad del adaptador y sus condiciones de uso legal.
- Riesgo de alucinacion: al ser un modelo de 1.5B, las alucinaciones son frecuentes, especialmente en tareas que requieren conocimiento factual o razonamiento complejo.
- Sesgos desconocidos: sin informacion sobre los datos de entrenamiento, no es posible evaluar sesgos de genero, raza, cultura o ideologia que el adaptador pueda haber introducido o amplificado.
- Licencia incierta: aunque el modelo base es Apache 2.0, la licencia del adaptador no esta especificada. Esto genera incertidumbre legal para uso comercial.
- Sin garantias de calidad: al no haber benchmarks ni evaluaciones, no hay evidencia de que el adaptador mejore realmente al modelo base en la tarea de dialogos NPC.
- Limitaciones de contexto: aunque el base soporta 32.768 tokens, el adaptador puede haber sido entrenado con secuencias mas cortas, lo que podria degradar el rendimiento en contextos largos.
- Riesgo de sobreajuste: un adaptador LoRA entrenado con un dataset pequeno puede sobreajustarse a patrones especificos y perder generalidad.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/TokaiTieo/qwen2-1.5b-npc-lora
- Modelo base Qwen2-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2-1.5B-Instruct
- Documentacion de Qwen2 en Transformers: https://huggingface.co/docs/transformers/model_doc/qwen2
- Repositorio oficial de Qwen2: https://github.com/QuantumEclipseAI/Qwen2
- Documentacion de LoRA en torchtune: https://meta-pytorch.org/torchtune/stable/generated/torchtune.models.qwen2.lora_qwen2_1_5b.html
