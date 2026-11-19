# tooltd/Qwen3.8-27B-IQ4-XS-16GB-VRAM-GGUF

## Resumen
Qwen3.8-27B-IQ4-XS-16GB-VRAM-GGUF es un repositorio de cuantizaciones GGUF del modelo multimodal Qwen/Qwen3.8-27B, publicado por el usuario tooltd. No se trata de un modelo entrenado desde cero, sino de una distribucion de pesos comprimidos mediante una metodologia propia denominada ZB-ZipBrain, que combina asignacion de bits por tensor basada en coste marginal tasa-distorsion con calibracion mediante importance matrix. El objetivo declarado es encajar un modelo de 27.320.697.856 parametros en GPUs de consumo de 16 GB de VRAM a ~4 BPW y en tarjetas de 12 GB a ~3 BPW.

El modelo base es multimodal (pipeline image-text-to-text) y la licencia declarada es Apache 2.0. La relevancia practica del repositorio reside en que permite ejecutar un modelo de casi 27.300 millones de parametros en hardware de gama alta consumer sin renunciar a una calidad medida: la variante IQ4_XS de 12,74 GB obtiene un 92,1% de HumanEval+ y un 78,0% de MBPP+, con una divergencia KL de 0,033810 frente al baseline BF16.

La ficha cubre exclusivamente la informacion publicada en la model card y en los metadatos del repositorio. Los detalles de arquitectura interna, composicion del dataset de entrenamiento y ventana de contexto del modelo base no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B, multimodal image-text-to-text) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ4_XS (ZB4.00-MIN-v5.1), IQ3_M_XL (ZB3.88-MIN-v5), IQ3_M_L (ZB3.73-MIN-v5.1), IQ3_XXS (ZB3.00bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria llama.cpp) |

## Arquitectura y entrenamiento
El repositorio no entrena ningun modelo: distribuye pesos cuantizados del base Qwen/Qwen3.8-27B. La innovacion tecnica descrita es ZB-ZipBrain, un metodo de cuantizacion de precision mixta que asigna bits por tensor optimizando el coste marginal tasa-distorsion combinado con calibracion por importance matrix (imatrix). El autor indica que identifica puntos de operacion Pareto-optimos en BPW para maximizar calidad bajo restricciones exactas de VRAM. Las variantes marcadas como v5 combinan ZB con "Pelicanmaxxing" para evaluacion visual, con ajuste iterativo hasta estabilizar la calidad de salida.

No se documentan en la informacion disponible ni la arquitectura del transformer subyacente, ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo RLHF/DPO. Tampoco se especifican mecanismos de atencion, decodificacion especulativa ni otras innovaciones del modelo base.

## Capacidades
- Generacion de texto conversacional (tag `conversational` en el repositorio).
- Procesamiento de imagen y texto de entrada (pipeline `image-text-to-text`), con evaluacion visual especifica en las variantes v5.
- Generacion de codigo: validada con HumanEval (164 tareas) y MBPP (378 tareas) en modo no-thinking.
- Razonamiento y matematicas: no hay evaluaciones publicadas en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Modo thinking: las evaluaciones publicadas se ejecutaron en modo no-thinking, lo que sugiere que el modelo base dispone de un modo thinking, aunque no se detalla su comportamiento.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).

## Casos de uso
- Despliegue local en GPU de 16 GB: la variante ZB4.00-MIN-v5.1-IQ4_XS ocupa 12,74 GB y deja margen para cache KV cuantizada (ctk/ctv q4_0), lo que permite servir un modelo de 27.300 millones de parametros en una RTX 4080/4090 o similar.
- Despliegue en GPU de 12 GB: la variante ZB3.00bpw-IQ3_XXS esta disenada para ese presupuesto de VRAM, con un coste medido de 0,884 en HumanEval+ y 0,743 en MBPP+.
- Asistencia de codigo en local: con 0,921 en HumanEval+ y 0,780 en MBPP+ en la variante IQ4_XS, es adecuado para autocompletado y generacion de funciones en entornos sin conexion o con requisitos de privacidad.
- Procesamiento de documentos con imagen: al ser un modelo image-text-to-text, puede emplearse en extraccion de informacion de capturas, formularios escaneados o diagramas, siempre que se valide la calidad visual con las variantes v5.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio publica KLD, same top-p y PPL frente a un baseline BF16, lo que lo convierte en un banco de pruebas para estudiar el impacto de la precision mixta.
- Prototipado de aplicaciones conversacionales: el tag `conversational` y la compatibilidad con endpoints permiten integrarlo en backends de chat con llama.cpp como servidor.
- Sustitucion de cuantizaciones estandar en pipelines existentes: al ser GGUF compatible con llama.cpp, puede reemplazar variantes IQ4_XS de otros proveedores (unsloth, bartowski, mradermacher) sin cambios en el codigo de inferencia.

## Benchmarks y rendimiento
Resultados EvalPlus en modo no-thinking, pass@1, con kvcache ctk/ctv q4_0:

| Cuantizacion | HumanEval | HumanEval+ | MBPP | MBPP+ | Proveedor |
|---|---|---|---|---|---|
| ZB4.00-MIN-v5.1-IQ4_XS | 0,945 | 0,921 | 0,897 | 0,780 | tooltd (ZB-MIN) |
| Qwen3.8-27B-IQ4_NL | 0,951 | 0,915 | 0,902 | 0,778 | bartowski |
| ZB3.88-MIN-v5-IQ3_M_XL | 0,945 | 0,915 | 0,910 | 0,775 | tooltd (ZB-MIN) |
| GSQ-RCO-BuffedMod | 0,921 | 0,890 | 0,897 | 0,772 | tooltd |
| Qwen3.8-27B-Ridge-3.7bpw | 0,933 | 0,896 | 0,902 | 0,765 | empero-ai |
| ZB3.73-MIN-v5.1-IQ3_M_L | 0,927 | 0,896 | 0,881 | 0,757 | tooltd (ZB-MIN) |
| ZB3.00bpw-IQ3_XXS | 0,927 | 0,884 | 0,865 | 0,743 | tooltd (ZB-MIN) |
| UD3-IQ4_XS | 0,890 | 0,866 | 0,897 | 0,751 | unsloth |
| UD3-Q3_K_XL | 0,823 | 0,805 | 0,881 | 0,751 | unsloth |

Metricas de fidelidad frente al baseline BF16 (Mean PPL = 6,950493), calculadas con `llama-perplexity` sobre wikitext-2-raw:

| Etiqueta | Proveedor | Tamano (GB) | Mean KLD | Same top-p (%) | Mean PPL |
|---|---|---|---|---|---|
| UD-Q8_K_XL | unsloth old | 29,30 | 0,000850 | 98,970 | 6,953800 |
| UD-Q6_K_XL | unsloth old | 24,14 | 0,001380 | 98,520 | 6,953600 |
| Q6_K | unsloth old | 21,31 | 0,002290 | 97,860 | 6,950700 |
| Q5_K_M | unsloth old | 18,47 | 0,006220 | 96,700 | 6,974200 |
| UD-Q4_K_XL | unsloth old | 16,69 | 0,008606 | 96,091 | 6,979220 |
| ZB4.97-GOD-IQ4_XS | ZB-GOD | 15,82 | 0,012249 | 95,337 | 7,004243 |
| UD3-Q4_K_S | unsloth UD3 | 14,30 | 0,013652 | 95,149 | 6,969514 |
| Autoround-Q4_K_M | Autoround | 15,66 | 0,014657 | 94,859 | 6,950294 |
| ZB4.65-PRO-IQ4_XS | ZB-PRO | 14,81 | 0,015466 | 94,766 | 7,017278 |
| Q4_K_M | unsloth old | 15,93 | 0,015490 | 94,650 | 6,956100 |
| IQ4_NL | bartowski | 15,20 | 0,018427 | 94,230 | 7,006472 |
| IQ4_XS | unsloth old | 14,63 | 0,018652 | 94,270 | 7,012695 |
| UD3-IQ4_XS | unsloth UD3 | 13,27 | 0,018772 | 93,975 | 7,004732 |
| IQ4_XS-i1 | mradermacher | 14,26 | 0,019271 | 94,141 | 7,012810 |
| ZB4.00-MIN-v5.1-IQ4_XS | ZB-MIN | 12,74 | 0,033810 | 92,309 | 7,106519 |

## Requisitos de hardware
- VRAM estimada: 12,74 GB para ZB4.00-MIN-v5.1-IQ4_XS; 13,19 GB para ZB4.14-MIN-IQ4_XS; aproximadamente 12 GB o menos para la variante ZB3.00bpw-IQ3_XXS. Hay que anadir el espacio de cache KV, que en las pruebas se cuantizo a q4_0.
- GPUs objetivo: tarjetas de 16 GB de VRAM a ~4 BPW (por ejemplo RTX 4080, RTX 4060 Ti 16 GB, RTX 5070 Ti) y tarjetas de 12 GB a ~3 BPW (RTX 4070, RTX 3060 12 GB).
- Cabe en GPU consumer: si, ese es el proposito explicito del repositorio.
- Opciones de despliegue: llama.cpp (motor de referencia, con `llama-perplexity` y `llama-server`), y por extension cualquier runtime compatible con GGUF como Ollama o LM Studio. vLLM y TGI no estan mencionados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
La comparacion relevante es entre cuantizaciones del mismo modelo base, no entre modelos distintos:

| Criterio | ZB4.00-MIN-v5.1-IQ4_XS (tooltd) | UD3-IQ4_XS (unsloth) | IQ4_NL (bartowski) |
|---|---|---|---|
| Tamano | 12,74 GB | 13,27 GB | 15,20 GB |
| Mean KLD | 0,033810 | 0,018772 | 0,018427 |
| Same top-p | 92,309% | 93,975% | 94,230% |
| HumanEval | 0,945 | 0,890 | 0,951 |
| HumanEval+ | 0,921 | 0,866 | 0,915 |
| MBPP+ | 0,780 | 0,751 | 0,778 |
| Licencia | Apache 2.0 | Apache 2.0 | Apache 2.0 |

El resultado es un compromiso claro: la variante de tooltd ocupa entre 0,5 y 2,5 GB menos que las alternativas, pero presenta mayor divergencia KL y menor same top-p. En tareas de codigo medidas con EvalPlus rinde al nivel o por encima de las alternativas, pese a la perdida de fidelidad distribucional.

## Limitaciones y advertencias
- La variante IQ4_XS optimizada para 16 GB presenta la peor fidelidad distribucional de la tabla (KLD 0,033810, same top-p 92,309%) y el mayor PPL (7,106519) frente al baseline de 6,950493. La degradacion es medible y puede afectar a tareas generativas no cubiertas por EvalPlus.
- Las evaluaciones de codigo se realizaron en modo no-thinking con cache KV cuantizada a q4_0; los resultados en modo thinking o con cache FP16 no estan publicados.
- No hay datos sobre sesgos, tasas de alucinacion, rendimiento multilingue ni comportamiento en contextos largos.
- El repositorio tiene un tamano de 266,7 GB, por lo que descargar el conjunto completo de cuantizaciones no es viable en discos pequenos; conviene descargar solo el archivo GGUF necesario.
- La licencia Apache 2.0 se hereda del modelo base, pero conviene verificar las condiciones del modelo Qwen/Qwen3.8-27B original antes de un uso comercial.
- El autor de la cuantizacion es un usuario individual (tooltd) y la metodologia ZB-ZipBrain no esta descrita en detalle ni acompanada de publicacion tecnica en la informacion disponible.
- Las variantes v5 incorporan ajuste iterativo orientado a evaluacion visual; no se especifica el conjunto de validacion empleado ni su representatividad.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/tooltd/Qwen3.8-27B-IQ4-XS-16GB-VRAM-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Archivo ZB4.00-MIN-v5.1-IQ4_XS: https://huggingface.co/tooltd/Qwen3.8-27B-IQ4-XS-16GB-VRAM-GGUF/blob/main/Qwen3.8-27B-ZB4.00-MIN-v5.1-IQ4_XS.gguf
- Archivo ZB3.88-MIN-v5-IQ3_M_XL: https://huggingface.co/tooltd/Qwen3.8-27B-IQ4-XS-16GB-VRAM-GGUF/blob/main/Qwen3.8-27B-ZB3.88-MIN-v5-IQ3_M_XL.gguf
- Archivo ZB3.73-MIN-v5.1-IQ3_M_L: https://huggingface.co/tooltd/Qwen3.8-27B-IQ4-XS-16GB-VRAM-GGUF/blob/main/Qwen3.8-27B-ZB3.73-MIN-v5.1-IQ3_M_L.gguf
- Archivo ZB3.00bpw-IQ3_XXS: https://huggingface.co/tooltd/Qwen3.8-27B-IQ4-XS-16GB-VRAM-GGUF/blob/main/Qwen3.8-27B-ZB3.00bpw-IQ3_XXS.gguf
- Repositorio GSQ-RCO-BuffedMod del mismo autor: https://huggingface.co/tooltd/Qwen3.8-27B-GSQ-RCO-BuffedMod-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
