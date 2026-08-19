# VenkataRamanaKurumallajaddangi/Telugu

## Resumen

Jaddangi AI Telugu 78M Instruct (V2) es un modelo de lenguaje autoregresivo de 78 millones de parametros, desarrollado desde cero por Kurumalla Venkataramana (Jaddangi AI) especificamente para el idioma telugu. Se trata de un transformer decoder-only con arquitectura personalizada que incorpora optimizaciones como Grouped Query Attention (GQA) y activaciones SwiGLU, disenado para ejecutarse eficientemente en hardware modesto, como procesadores i3 con 12 GB de RAM.

El modelo resuelve el problema de la escasez de modelos de lenguaje de calidad para telugu, un idioma hablado por mas de 80 millones de personas en India y con poca representacion en el ecosistema de IA open source. Su relevancia radica en que ofrece una alternativa ligera y de codigo abierto (licencia Apache 2.0) para tareas de generacion de texto y asistencia conversacional en telugu, con un proceso de entrenamiento que combina pre-entrenamiento en corpus extensos y ajuste fino supervisado con pares de instrucciones.

La arquitectura incluye un tokenizer SentencePiece personalizado de 32k vocabulario, 12 capas, d_model de 576, y atencion con 8 cabezas de consulta y 2 de clave/valor. El modelo se distribuye en formato PyTorch con pesos en un unico archivo .pt, lo que requiere cargar las definiciones de clase personalizadas antes de usar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only personalizado (GQA, SwiGLU, RMSNorm, RoPE) |
| Parametros totales | 78 millones |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en FP16/BF16 segun entrenamiento) |
| Idiomas soportados | telugu (te) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) con definiciones de clase personalizadas |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only construido desde cero con varias optimizaciones modernas. Usa Grouped Query Attention con 8 cabezas de consulta y 2 cabezas de clave/valor, lo que reduce el coste de memoria y computo en comparacion con la atencion multi-cabeza estandar. Las activaciones SwiGLU sustituyen a las ReLU tradicionales, y la normalizacion RMSNorm junto con embeddings posicionales rotatorios (RoPE) completan el diseno. El tokenizer es un SentencePiece personalizado con un vocabulario de 32k subpalabras.

El entrenamiento se realizo en dos fases. Primero, un pre-entrenamiento sobre un corpus masivo de texto en telugu, incluyendo Wikipedia y el dataset C4, utilizando precision mixta FP16/BF16 y acumulacion de gradientes para optimizar el uso de memoria. Despues, un ajuste fino supervisado (SFT) sobre pares de instrucciones en telugu derivados del dataset de instrucciones `10xtechnologieS`, con el objetivo de adoptar una personalidad de asistente conversacional. El formato de prompt usa los marcadores `మనుషుడు:` (humano) y `సహాయకుడు:` (asistente).

## Capacidades

- Generacion de texto en telugu: produce respuestas coherentes y contextualmente apropiadas en este idioma.
- Razonamiento basico: el ajuste fino con instrucciones logicamente estructuradas busca mejorar la capacidad de seguir instrucciones y responder con logica.
- Asistencia conversacional: disenado para adoptar una personalidad de chatbot util y cooperativo.
- Eficiencia en hardware limitado: optimizado para ejecutarse en CPUs modestas (i3, 12 GB RAM), lo que permite inferencia local sin GPU.
- Tokenizer especializado: el vocabulario SentencePiece de 32k esta adaptado a la morfologia del telugu.
- No se mencionan capacidades de tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Asistente de escritura en telugu: redaccion de textos, correccion gramatical y generacion de contenido creativo (poemas, relatos) en telugu, aprovechando el ajuste fino con datos de instrucciones.
- Educacion y aprendizaje del idioma: generar ejercicios, explicaciones y respuestas a preguntas frecuentes sobre gramatica y vocabulario telugu para estudiantes.
- Atencion al cliente local: desplegar el modelo como chatbot basico para responder consultas frecuentes en telugu en pequenos negocios o servicios publicos regionales, gracias a su bajo coste de inferencia en CPU.
- Procesamiento de documentos: resumir o extraer informacion de textos largos en telugu, como articulos de prensa local o documentos administrativos.
- Desarrollo de aplicaciones offline: integrar el modelo en aplicaciones moviles o de escritorio que requieran procesamiento de lenguaje natural en telugu sin conexion a internet.
- Investigacion linguistica: servir como modelo base para experimentos de fine-tuning en tareas especificas del telugu, como analisis de sentimiento o clasificacion de textos, dado su tamano reducido y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo esta disenado para funcionar en procesadores i3 con 12 GB de RAM, segun el autor.
- VRAM estimada: al ser un modelo de 78M parametros, cabria en GPUs con 2-4 GB de VRAM en FP16, aunque no se proporcionan datos oficiales.
- GPUs recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) seria suficiente, aunque no se indica soporte oficial.
- Opciones de despliegue: al ser una arquitectura personalizada en PyTorch, el despliegue requiere cargar las definiciones de clase manualmente. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de tamano similar especializados en telugu. El autor tiene otros modelos en su perfil (Jaddangi-Ai-Telugu-1B, Telugu6800, Telugu7200lora) que parecen ser variantes o versiones posteriores, pero no se dispone de especificaciones detalladas para comparar.

## Limitaciones y advertencias

- Tamano reducido: con solo 78M parametros, el modelo tiene una capacidad limitada para tareas complejas de razonamiento o generacion de conocimiento factual.
- Idioma unico: solo soporta telugu; no puede procesar otros idiomas.
- Arquitectura personalizada: requiere cargar definiciones de clase manualmente, lo que complica su integracion con frameworks estandar de inferencia.
- Riesgo de alucinacion: como todo modelo pequeno, puede generar contenido falso o inconsistente, especialmente en temas especializados.
- Sesgos: el entrenamiento sobre Wikipedia y C4 puede reflejar los sesgos presentes en esos corpus.
- Sin benchmarks publicados: no hay datos objetivos de rendimiento para evaluar su calidad frente a otros modelos.
- Formato de pesos propietario: el archivo .pt no es compatible con formatos estandar como safetensors o GGUF, lo que limita su uso en herramientas comunes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VenkataRamanaKurumallajaddangi/Telugu
- Repositorio del autor: https://huggingface.co/VenkataRamanaKurumallajaddangi
- Variante LoRA: https://huggingface.co/VenkataRamanaKurumallajaddangi/Telugu7200lora
- Version 1B: https://huggingface.co/VenkataRamanaKurumallajaddangi/Jaddangi-Ai-Telugu-1B
- Dataset de poemas sinteticos: https://huggingface.co/VenkataRamanaKurumallajaddangi/datasets
- Dataset de QA sintetico: https://huggingface.co/datasets/VenkataRamanaKurumallajaddangi/Telugu-Synthetic-QA-20k
