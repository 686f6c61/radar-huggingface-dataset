# the-jashthakkar/JanusIR-500M-Research

## Resumen

JanusIR-500M-Research es un modelo de lenguaje autoregresivo de 545,7 millones de parámetros (545.692.999 parámetros entrenables) desarrollado por el usuario the-jashthakkar y publicado en HuggingFace bajo licencia Apache 2.0. No es un modelo de propósito general: está especializado en el análisis estático y el razonamiento sobre la representación intermedia (IR) de LLVM, el formato de código intermedio que utilizan las herramientas del ecosistema LLVM (clang, opt, llc). Su objetivo declarado es predecir estructuras de grafo de flujo de control (CFG), trazar dependencias def-use y resolver invariantes de la forma SSA phi.

La arquitectura es un híbrido multimodal dentro del dominio del compilador: combina un decodificador transformer causal que procesa texto de LLVM IR con una red relacional de atención sobre grafos (RGAT) que procesa la estructura del programa, unidas mediante capas de cross-attention con compuerta. El modelo se distribuye como pesos PyTorch, con un tamaño de repositorio de 2,2 GB y soporte declarado únicamente para inglés (en la práctica, para el dialecto textual de LLVM IR).

Es relevante porque aborda un nicho poco cubierto por los modelos generalistas: el razonamiento estructural sobre programas a nivel de IR, una tarea donde los LLM convencionales rinden mal y donde las herramientas clásicas de análisis estático exigen reglas escritas a mano. Los resultados publicados por el autor son modestos (F1 combinado del 37,74 %), por lo que debe considerarse material de investigación más que un componente listo para producción. Se trata además de un modelo con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida autoregresiva consciente del compilador: transformer causal + RGAT (Relational Graph Attention) + cross-attention con compuerta |
| Parametros totales | 545.692.999 (545,7 M) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en); dominio efectivo: LLVM IR textual |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (librería declarada: pytorch; tamaño de repositorio 2,2 GB) |

Especificaciones internas declaradas por el autor:

| Parametro | Valor |
|---|---|
| Dimension del modelo (d_model) | 1280 |
| Capas del transformer | 20 |
| Cabezas de atencion | 16 |
| Dimension feed-forward (d_ff) | 5120 (SwiGLU/MLP) |
| Tamano de vocabulario | 4096 (tokenizer BPE de compilador) |
| Dimension oculta del grafo | 384 |
| Capas de grafo (RGAT) | 4 |
| Capas de fusion | 3 |
| Embeddings posicionales | RoPE (theta = 10000,0) |
| Normalizacion | RMSNorm (epsilon = 1e-05) |

## Arquitectura y entrenamiento

El modelo emplea un diseño de doble flujo. Por un lado, un decodificador transformer causal estándar (20 capas, d_model 1280, 16 cabezas, d_ff 5120, SwiGLU, RMSNorm y RoPE) que modela la secuencia de tokens de LLVM IR con un vocabulario BPE de 4096 entradas, muy reducido en comparación con los tokenizers de propósito general. Por otro, un codificador de grafos relacional (RGAT) de 4 capas y 384 dimensiones ocultas que representa la estructura del programa mediante aristas multi-relacionales: aristas de CFG, aristas def-use y aristas correspondientes a los nodos phi de SSA. Tres capas de cross-attention con compuerta fusionan ambos flujos. La ventana de contexto está limitada a 1024 tokens, suficiente para funciones individuales o fragmentos de IR, pero no para módulos completos.

El entrenamiento se organizó en cuatro etapas: (A) preentrenamiento de lenguaje causal sobre AnghaBench y corpus de LLVM IR de código abierto; (B) preentrenamiento estructural del GAT multi-relacional sobre aristas de CFG, def-use y SSA phi; (C) preentrenamiento conjunto cross-modal con regularización de alineamiento estructural; y (D) ajuste supervisado multi-tarea con instrucciones sobre alcanzabilidad en CFG, trazado def-use y resolución de invariantes phi, usando enmascaramiento de pérdida solo en la completación (completion-only loss masking). No se menciona en la información disponible el uso de RLHF o DPO, ni el número total de tokens de entrenamiento. Síntesis interna (información externa): no se dispone de detalles adicionales sobre composición exacta del dataset ni hiperparámetros de entrenamiento.

## Capacidades

- Predicción de alcanzabilidad entre bloques básicos en el grafo de flujo de control (CFG) de LLVM IR.
- Extracción de dependencias def-use y trazado de valores a través de instrucciones.
- Resolución de procedencia y verificación de invariantes en nodos phi de SSA.
- Asistencia a pases de optimización del compilador, en concreto propagación de constantes y eliminación de código muerto.
- Generación de texto autoregresiva sobre secuencias de LLVM IR (pipeline `text-generation`).
- Razonamiento estructural conjunto texto-grafo gracias a las capas de fusión cross-modal.
- Validez sintáctica y parseo de instrucciones del 100,0 % según la evaluación declarada por el autor.
- No dispone de soporte declarado de tool calling ni function calling.
- No dispone de soporte declarado para agentes o razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Análisis de alcanzabilidad en CFG: el modelo recibe una función en LLVM IR y predice qué bloques básicos son alcanzables desde un punto de entrada, útil para construir herramientas de análisis estático propias sin escribir reglas manuales para cada patrón.
- Trazado def-use para análisis de dependencias: permite identificar la cadena de definiciones y usos de una variable, lo que sirve de base para detectar código muerto, calcular slices de programa o auditar flujos de datos.
- Verificación de invariantes SSA phi: comprobar que los valores entrantes de un nodo phi son coherentes con las aristas del CFG, tarea típica en la validación de transformaciones que manipulan SSA.
- Asistencia a pases de optimización: como componente de sugerencia dentro de un pase personalizado, proponiendo qué instrucciones son candidatas a propagación de constantes o a eliminación, siempre con verificación posterior mediante `opt` o `llc`.
- Auditoría de seguridad sobre IR: análisis estático de binarios o módulos compilados en busca de flujos sospechosos, aprovechando el tokenizer especializado en IR en lugar de tratar el código como texto genérico.
- Investigación académica en representaciones híbridas texto-grafo: el modelo es un banco de pruebas para estudiar la fusión de un decodificador causal con un GAT, y el autor publica gráficas de ablación arquitectónica.
- Modelo base para fine-tuning en tareas específicas de compiladores: con 545,7 M de parámetros y licencia Apache 2.0, es viable ajustarlo con datos propios de un toolchain concreto en una única GPU de gama alta.
- Generación de explicaciones textuales de estructuras de IR: descripciones en lenguaje natural de qué hace un bloque básico o por qué se alcanza una ruta, útiles en documentación interna de equipos de compiladores.
- Preprocesado en pipelines de CI/CD: ejecución del modelo como paso de comprobación antes de aplicar una transformación agresiva, bloqueando el merge si la verificación con herramientas de LLVM falla.

## Benchmarks y rendimiento

Resultados publicados por el autor para la variante "champion" (arquitectura completa + SFT), sobre 50 programas reales de compilador en C reservados para evaluación, con generación greedy determinista (temperatura = 0,0) y verificación exacta contra las herramientas del compilador:

| Tarea de evaluacion | Accuracy (Jaccard) | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| Control-Flow Graph (CFG) | 33,74 % | 60,77 % | 39,43 % | 43,37 % |
| Data-Flow Graph (DFG) | 22,47 % | 30,00 % | 27,13 % | 25,28 % |
| Invariantes SSA phi | 43,06 % | 46,80 % | 45,28 % | 44,58 % |
| Combinado global | 33,09 % | 45,86 % | 37,28 % | 37,74 % |

Datos adicionales declarados: validez sintáctica y parseo de instrucciones del 100,0 %. No se han publicado en la información disponible resultados comparativos frente a modelos de la misma categoría (MMLU, HumanEval, GSM8K u otros benchmarks estándar no aplican a este dominio ni aparecen reportados).

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del recuento de 545,7 M de parámetros, no confirmado por el autor): en FP16 aproximadamente 1,1 GB solo de pesos; en INT8 unos 0,55 GB; en INT4 unos 0,3 GB. Hay que sumar la memoria de activaciones, del codificador de grafo y de la caché KV para 1024 tokens, por lo que conviene reservar al menos 2-4 GB en FP16.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM debería ser suficiente en FP16; modelos como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB), A100 o H100 no presentan ninguna dificultad. El cuello de botella no es la memoria sino la disponibilidad de kernels optimizados.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo con 4 GB o más de VRAM, incluida una RTX 3050 de 8 GB.
- Opciones de despliegue: la model card declara `library_name: pytorch` e `inference: false`, por lo que no hay soporte confirmado para vLLM, llama.cpp, Ollama o TGI. El escenario realista es cargar los pesos directamente con PyTorch y ejecutar el grafo completo (transformer + RGAT + fusión), lo que impide usar runtimes de inferencia de texto convencionales sin adaptaciones.
- Latencia y throughput estimados: no disponibles. El autor no publica medidas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No disponible. En la información proporcionada no se identifican modelos comparables de la misma categoría (LLM especializados en LLVM IR con codificador de grafos integrado), y el autor no ofrece comparaciones frente a alternativas. Los resultados de búsqueda web recuperados no contienen ninguna referencia relevante al modelo ni a herramientas equivalentes, por lo que no se puede construir una tabla comparativa fiable.

## Limitaciones y advertencias

- Ventana de contexto muy reducida: 1024 tokens, suficiente para funciones pequeñas o fragmentos de IR, pero insuficiente para módulos completos o programas grandes.
- Idioma limitado al inglés y al dialecto textual de LLVM IR; no soporta diálogo conversacional ni otros lenguajes naturales.
- Rendimiento modesto en los benchmarks publicados: F1 combinado del 37,74 % y accuracy Jaccard del 22,47 % en data-flow graph, lo que implica una tasa elevada de falsos positivos y negativos en la práctica.
- Riesgo de alucinación relevante: el modelo genera secuencias de IR y predicciones estructurales que pueden ser sintácticamente válidas pero semánticamente incorrectas. El propio autor recomienda verificar con `opt` o `llc` antes de aplicar cualquier transformación en entornos críticos.
- Fuera de alcance explícito: no está pensado para diálogo conversacional ni para transpilación arbitraria de código fuente a código fuente.
- Licencia Apache 2.0: permisiva, permite uso comercial y modificaciones, con obligación de conservar el aviso de licencia y de atribución. No hay restricciones de uso comercial declaradas.
- Madurez muy baja: cero descargas y cero likes en HuggingFace, sin comunidad ni validación independiente de los resultados. Los benchmarks son de 50 programas y han sido producidos por el propio autor, sin replicación externa.
- El repositorio indica `inference: false`, es decir, no está preparado para el servicio de inferencia alojado de HuggingFace.
- Posible problema de metadatos: las fechas de creación y actualización (2026-09-29) son posteriores a la fecha habitual de publicación, lo que sugiere un error o una configuración manual del entorno de subida.
- No se documentan sesgos específicos, pero al entrenarse sobre corpus de código de compilador cabe esperar sesgos hacia los patrones de generación de código de clang/LLVM y hacia las construcciones que aparecen en AnghaBench.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/the-jashthakkar/JanusIR-500M-Research
- No se han encontrado en la búsqueda web otros enlaces relevantes al modelo (paper, repositorio de código, blog del autor ni demo). Los resultados devueltos por el buscador correspondían al artículo gramatical inglés "the" y no guardan relación con el modelo.
