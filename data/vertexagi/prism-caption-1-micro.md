# VertexAGI/prism-caption-1-micro

## Resumen

Prism Caption 1 Micro es un modelo de lenguaje de 1.301.875.840 parámetros (aproximadamente 1,3 mil millones) desarrollado por VertexAGI, especializado en una única tarea: generar títulos cortos y específicos para conversaciones de chat a partir del primer mensaje del usuario. Se trata de un ajuste fino mediante LoRA sobre `mlx-community/gemma-3-1b-it-4bit`, que a su vez deriva de Gemma 3 1B de Google, y se distribuye en formato MLX de 4 bits y GGUF Q4_K_M.

El modelo resuelve un problema acotado pero recurrente en productos conversacionales: el auto-nombrado de conversaciones tipo "New chat", funcionalidad presente en asistentes como ChatGPT o Claude. En lugar de enrutar esta tarea a un modelo generalista grande, Prism Caption 1 Micro permite ejecutarla localmente con un coste computacional mínimo. Su entrenamiento se basa en destilación desde `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning` sobre un conjunto de 339 ejemplos de primeros mensajes realistas.

La relevancia del modelo reside en su enfoque de especialización extrema: no pretende ser un modelo conversacional general, sino una pieza de infraestructura para pipelines de producto. Su principal mejora medible frente al modelo base no es la calidad semántica del título (ambos promedian 4,0 palabras) sino la fiabilidad de formato, con 0/20 salidas mal formadas frente a 3/20 del base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text), ajuste fino LoRA |
| Parametros totales | 1.301.875.840 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit (MLX, group size 64); Q4_K_M (GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX 4-bit) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de `mlx-community/gemma-3-1b-it-4bit`, una version cuantizada a 4 bits de Gemma 3 1B en su variante instruct, con arquitectura transformer decoder-only propia de la familia Gemma 3. Sobre esta base se aplico un ajuste fino mediante LoRA con rango 8 y 8 capas, durante 1.500 iteraciones. La perdida de validacion minima alcanzada fue de 0,163 en la iteracion 800, aunque el autor indica que el entrenamiento estaba esencialmente convergido desde la iteracion 300.

El dataset de entrenamiento consta de 339 ejemplos de primeros mensajes realistas distribuidos en aproximadamente 50 tematicas cotidianas (programacion, viajes, cocina, finanzas, salud, entre otras), emparejados con titulos generados por el modelo profesor `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning` a traves de la capa gratuita de OpenRouter. Se trata, por tanto, de destilacion de comportamiento en un dominio muy estrecho, no de un entrenamiento general.

Una innovacion practica relevante documentada por el autor es la advertencia sobre el tokenizer de Gemma 3: solo registra `<eos>` (id 1) como token de parada por defecto, pero la plantilla de chat cierra cada turno con `<end_of_turn>` (id 106). Si el codigo de inferencia no anade este segundo token como condicion de parada, la generacion continua mas alla del titulo correcto y produce tokens basura o de relleno. En llama.cpp este comportamiento ya esta gestionado por su manejo nativo de la plantilla de Gemma 3.

## Capacidades

- Generacion de titulos de conversacion a partir del primer mensaje del usuario, con formato de 3 a 6 palabras, en title case, sin comillas ni puntuacion final.
- Generacion de texto autoregresiva basica heredada del modelo base, aunque no es su proposito.
- Soporte de plantilla de chat conversacional (formato de turnos de Gemma 3).
- Capacidad multilingue limitada al ingles, segun la etiqueta de idioma del repositorio.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision, audio ni modo thinking, a pesar de que el nombre del modelo profesor incluya "omni".

## Casos de uso

- Auto-nombrado de conversaciones en asistentes conversacionales: al recibir el primer mensaje de un usuario, el modelo genera un titulo de 3 a 6 palabras que se muestra en la barra lateral del historial. Su tamano de 1,3B parametros y su formato MLX 4-bit de 733 MB permiten ejecutarlo en el mismo dispositivo del cliente o en un servicio ligero sin coste apreciable.
- Etiquetado de sesiones en herramientas de soporte al cliente: en un panel de tickets o chats, el modelo puede generar etiquetas legibles para cada hilo entrante a partir del primer mensaje, facilitando la clasificacion visual y la busqueda posterior por parte de los agentes.
- Organizacion de historiales en aplicaciones de notas o productividad: cuando un usuario inicia una conversacion con un asistente integrado en una app de notas, el modelo produce un titulo descriptivo que sustituye al generico "Nueva conversacion", mejorando la navegabilidad del historial.
- Generacion de asuntos para hilos en foros o comunidades: a partir del primer mensaje de un hilo, el modelo puede proponer un asunto conciso y especifico, reduciendo la carga de moderacion y mejorando la legibilidad de listados.
- Procesamiento local en Apple Silicon: gracias al formato MLX y a su tamano reducido, el modelo puede ejecutarse integramente en un Mac con chip de la serie M mediante `mlx-lm`, sin dependencia de servicios en la nube, lo que resulta adecuado para aplicaciones de escritorio con requisitos de privacidad.
- Despliegue en entornos con recursos limitados mediante llama.cpp u Ollama: el archivo GGUF Q4_K_M de 1,01 GB permite integrar la funcionalidad de titulado en contenedores pequenos, dispositivos de borde o entornos de CI para pruebas automatizadas de interfaz.
- Generacion de titulos en pipelines de evaluacion o prototipado: por su bajo coste, el modelo puede emplearse para etiquetar grandes lotes de conversaciones sinteticas en tareas de analisis o anotacion, siempre que el contenido este en ingles.

## Benchmarks y rendimiento

El autor publica una evaluacion comparativa limitada entre el modelo base y el ajustado, sobre 20 primeros mensajes nuevos no vistos durante el entrenamiento:

| Metrica | Gemma-3-1B-it base | Prism Caption 1 Micro |
|---|---|---|
| Salidas con formato incorrecto (demasiado largas, multilinea o malformadas) | 3/20 | 0/20 |
| Media de palabras por titulo | 4,0 | 4,0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8-1,2 GB en cuantizacion de 4 bits, segun el formato (733 MB para MLX 4-bit, 1,01 GB para GGUF Q4_K_M) mas el overhead del runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas con 4 GB o mas de VRAM, como RTX 3050, RTX 4060 o superiores. Tambien puede ejecutarse en CPU sin problema.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con 4 GB o mas, y en Apple Silicon mediante MLX.
- Opciones de despliegue: `mlx-lm` en Apple Silicon, `llama.cpp`, Ollama y LM Studio mediante el archivo GGUF. No se documenta soporte para vLLM ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Enfoque |
|---|---|---|---|---|---|
| Prism Caption 1 Micro | 1,30B | no disponible | Apache 2.0 | MLX 4-bit, GGUF Q4_K_M | Titulado de chats especializado |
| Gemma 3 1B IT (base) | 1B | no disponible | Gemma license | safetensors, GGUF | Modelo generalista instruct |
| Nemotron-3-Nano-Omni 30B A3B (profesor) | 30B (MoE, 3B activos) | no disponible | no disponible | no disponible | Modelo generalista con razonamiento |

La comparacion mas directa es con el propio modelo base Gemma 3 1B IT, del que Prism Caption 1 Micro hereda arquitectura y capacidades generales pero al que supera en fiabilidad de formato para la tarea concreta de titulado (0/20 frente a 3/20 salidas mal formadas). Frente al modelo profesor, la diferencia de tamano es de mas de veinte veces, lo que ilustra el objetivo de destilacion: capturar un comportamiento estrecho en un modelo mucho menor. No se dispone de datos de benchmarks que permitan comparar rendimiento en tareas generales con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para titulado de chats; no funciona bien en ninguna otra tarea, segun reconoce el propio autor.
- El dataset de entrenamiento es muy reducido (339 ejemplos), lo que limita la cobertura de dominios y estilos de mensajes.
- Los titulos para primeros mensajes muy ambiguos o muy cortos pueden resultar genericos.
- Solo soporta ingles; los mensajes en otros idiomas no estan cubiertos por el entrenamiento.
- Riesgo de alucinacion inherente a los modelos de lenguaje, aunque acotado por la brevedad de las salidas y la naturaleza de la tarea.
- Advertencia critica de inferencia: es necesario anadir el token `<end_of_turn>` (id 106) como condicion de parada en MLX, ya que el tokenizer de Gemma 3 solo registra `<eos>` (id 1) por defecto; de lo contrario la generacion produce tokens basura tras el titulo.
- Licencia Apache 2.0 heredada del modelo base, lo que permite uso comercial, pero conviene verificar las condiciones de la licencia original de Gemma 3 por si existieran restricciones adicionales aplicables.
- No se documentan sesgos especificos, pero al derivar de Gemma 3 y entrenarse sobre un dataset pequeno, puede heredar sesgos del modelo base y del profesor.
- El repositorio registra 0 likes y 1.048 descargas en el momento de la consulta, lo que sugiere una adopcion limitada y poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VertexAGI/prism-caption-1-micro
- Modelo base: https://huggingface.co/mlx-community/gemma-3-1b-it-4bit
- Modelo profesor: https://huggingface.co/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning
- OpenRouter (proveedor del modelo profesor): https://openrouter.ai
- Repositorio de mlx-lm: https://github.com/ml-explore/mlx-lm
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
