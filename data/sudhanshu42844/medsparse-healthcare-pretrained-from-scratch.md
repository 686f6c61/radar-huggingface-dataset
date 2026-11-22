# sudhanshu42844/medsparse-healthcare-pretrained-from-scratch

## Resumen

MedSparse Healthcare es un modelo de lenguaje de tipo decoder-only con capas de mezcla de expertos (MoE) dispersa, inspirado en la arquitectura de Mixtral pero desarrollado desde cero por Sudhanshu Shukla (usuario `sudhanshu42844`). Se trata de un modelo de investigación de dominio sanitario, entrenado mediante preentrenamiento autorregresivo sobre texto biomédico procedente del subconjunto `common-pile/pubmed_filtered`. No contiene pesos de los modelos oficiales de Mistral ni de Mixtral; la inspiración es exclusivamente arquitectónica.

Con 38.779.008 parámetros totales, 4 capas de decoder, dimensión oculta de 384 y 4 expertos por bloque con selección top-2 por token, el modelo es deliberadamente compacto. Su relevancia no reside en el rendimiento absoluto, sino en servir como plataforma reproducible para experimentar con enrutamiento disperso de expertos y con tokenizadores de dominio médico entrenados desde cero, así como para inicializar un modelo posterior de ajuste supervisado (SFT) médico de parámetros completos.

El checkpoint exportado corresponde a 5000 pasos de optimizador, el objetivo configurado para la etapa 1 del proyecto, y se distribuye en formato nativo de PyTorch (no es un `AutoModelForCausalLM` registrado en Transformers). Se publica bajo licencia Apache 2.0 y está pensado exclusivamente para investigación, no para uso clínico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE dispersa top-2, inspirada en Mixtral |
| Parametros totales | 38.779.008 |
| Parametros activos | no disponible (top-2 de 4 expertos por bloque; el autor no publica el recuento activo) |
| Longitud de contexto | 2048 tokens configurados (entrenamiento con secuencias de 128 tokens) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en precisión original) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 (Copyright 2026 Sudhanshu Shukla) |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y `tokenizer.json` |

Otros datos tecnicos: 4 capas de decoder, dimension oculta 384, 6 cabezas de atencion de query y 2 de key/value (grouped-query attention), 4 expertos por bloque con dimension intermedia 768, nonlinearidad SwiGLU, RoPE para codificacion posicional y RMSNorm para normalizacion. Tamano del repositorio: 0,2 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con capas feed-forward sustituidas por bloques de mezcla de expertos dispersa: cada bloque contiene 4 expertos con dimension intermedia de 768 y un router que selecciona los 2 expertos mas probables para cada token (top-2). La atencion emplea grouped-query attention con 6 cabezas de query y 2 de key/value, RoPE como codificacion posicional y RMSNorm como normalizacion. La nonlinearidad de los expertos es SwiGLU. Todos los parametros son entrenables durante el preentrenamiento; no hay pesos congelados.

El entrenamiento consiste en preentrenamiento autorregresivo desde inicializacion aleatoria (etapa 1), optimizando entropia cruzada causal de siguiente token mas un objetivo auxiliar ponderado de equilibrado de carga del router MoE. La fuente de datos documentada es `common-pile/pubmed_filtered`, filtrada mediante los filtros de texto sanitario y metadatos de licencia del repositorio del proyecto. Se utiliza un tokenizador sanitario dedicado entrenado sobre texto del dominio, y la particion de validacion se realiza mediante hash determinista de documentos. El checkpoint exportado contiene 5000 pasos de optimizador, que es el objetivo configurado para la etapa 1. Las secuencias de preentrenamiento se configuraron a 128 tokens, muy por debajo de la longitud maxima posicional configurada de 2048. El checkpoint se exporta sin estado del optimizador ni rutas privadas de entrenamiento.

## Capacidades

- Generacion de texto autorregresiva en ingles, orientada a continuaciones de texto biomedico.
- Modelado de lenguaje causal con perdida de entropia cruzada y perplexidad como metricas de evaluacion.
- Enrutamiento disperso de expertos (top-2 de 4) por token, con objetivo auxiliar de equilibrado de carga.
- Tokenizador de dominio sanitario entrenado desde cero sobre texto medico.
- Capacidad de servir como inicializacion para ajuste supervisado (SFT) medico de parametros completos (existe un modelo derivado publicado por el mismo autor).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles segun los metadatos del modelo.

## Casos de uso

- Investigacion sobre enrutamiento de expertos: el modelo permite estudiar el comportamiento del router top-2 y el equilibrado de carga en un entorno de 4 expertos y 38,8 millones de parametros, con coste computacional bajo y checkpoint reproducible.
- Reproduccion de experimentos de preentrenamiento sanitario: sirve como referencia para replicar pipelines de preentrenamiento desde cero sobre `common-pile/pubmed_filtered` con tokenizador de dominio y particion por hash de documentos.
- Inicializacion de modelos SFT medicos: el autor lo plantea explicitamente como punto de partida para un modelo de ajuste supervisado de parametros completos, lo que permite ahorrar el coste del preentrenamiento inicial en experimentos academicos.
- Pruebas de integracion de arquitecturas personalizadas: al no ser un `AutoModelForCausalLM` registrado, es util para validar flujos de carga nativos con `load_model.py`, `safetensors` y `tokenizers` en entornos de investigacion.
- Docencia y formacion: su tamano reducido (0,2 GB de repositorio) y su arquitectura MoE explicita lo hacen adecuado para ilustrar el funcionamiento interno de un transformer con mezcla de expertos en cursos o talleres.
- Evaluacion de tokenizadores de dominio: permite comparar el efecto de un tokenizador sanitario dedicado frente a tokenizadores generalistas en tareas de modelado de lenguaje biomedico.
- Experimentos de contexto: la discrepancia entre los 2048 tokens configurados y los 128 tokens de entrenamiento permite estudiar la degradacion de generalizacion fuera de la longitud vista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que se evalua mediante entropia cruzada de entrenamiento y perplexidad, y que no se reportan benchmarks clinicos verificados de forma independiente, evaluaciones de seguridad medica ni garantias frente a alucinaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision de 32 bits para los 38,8 millones de parametros (el repositorio completo ocupa 0,2 GB en safetensors); en la practica cabe en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Una GPU integrada o incluso CPU es viable para inferencia de demostracion.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer de los ultimos anos (GTX 1050 en adelante) y en CPU.
- Opciones de despliegue: al ser una arquitectura nativa de PyTorch no registrada en Transformers, no es compatible directamente con vLLM, TGI, llama.cpp ni Ollama. El autor proporciona `load_model.py`, que importa `mixtral_lab.MixtralLM` desde el paquete del proyecto; el despliegue requiere descargar el repositorio y ejecutar ese script.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedSparse Healthcare (este modelo) | 38,8 M | 2048 configurados (128 en entrenamiento) | Decoder-only MoE top-2, 4 capas | Apache 2.0 | Hugging Face, carga nativa PyTorch |
| Mixtral 8x7B (Mistral AI) | 46,7 B totales, ~12,9 B activos | 32.768 tokens | Decoder-only MoE top-2, 32 capas | Apache 2.0 | Hugging Face, Transformers/vLLM |
| TinyLlama 1.1B | 1,1 B | 2048 tokens | Decoder-only denso | Apache 2.0 | Hugging Face, Transformers/vLLM |
| SmolLM-135M (Hugging Face) | 135 M | 2048 tokens | Decoder-only denso | Apache 2.0 | Hugging Face, Transformers/vLLM |

La comparativa es necesariamente asimetrica: MedSparse es dos ordenes de magnitud menor que TinyLlama y tres que Mixtral, y su interes es metodologico (MoE desde cero en dominio medico) mas que de rendimiento. Frente a modelos densos de tamano similar o algo mayor, su ventaja es la experimentacion con enrutamiento disperso; su desventaja es la ausencia de benchmarks publicados y de integracion con ecosistemas de despliegue estandar.

## Limitaciones y advertencias

- Modelo de investigacion: no es un dispositivo clinico ni un sistema de apoyo a decisiones medicas. No debe usarse para diagnostico, recomendaciones de tratamiento, dosificacion de medicamentos, triaje de pacientes ni decisiones automatizadas sobre pacientes.
- No se han publicado benchmarks clinicos verificados de forma independiente, evaluaciones de seguridad medica ni garantias frente a alucinaciones.
- La perdida de entrenamiento y la perplexidad miden calidad de modelado de lenguaje, no exactitud medica.
- La longitud de contexto configurada (2048 tokens) no implica capacidad demostrada: el preentrenamiento uso secuencias de 128 tokens, por lo que la generalizacion a contextos largos no esta validada.
- Los datos de origen pueden contener errores, contenido duplicado, guias medicas historicas, informacion personal embebida y ambiguedad de licencia; el filtrado de metadatos no confirma por si solo el permiso para redistribuir los pesos aprendidos.
- El modelo solo soporta ingles segun los metadatos; no hay soporte multilingue documentado.
- No es compatible con `AutoModelForCausalLM` de Transformers ni con los runners estandar (vLLM, TGI, llama.cpp, Ollama); requiere el script de carga nativo del proyecto.
- No es intercambiable con checkpoints oficiales de Mixtral.
- La licencia Apache 2.0 cubre los pesos y el codigo del repositorio, pero los datos de entrenamiento conservan sus propios terminos; conviene revisar `common-pile/pubmed_filtered` y sus fuentes upstream antes de un uso mas amplio.
- El modelo tiene 21 descargas y 0 likes en el momento de la consulta, y su card advierte de que los resultados dependen del snapshot de datos, tokenizador, filtrado de tokens, ajustes del optimizador y particion de validacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sudhanshu42844/medsparse-healthcare-pretrained-from-scratch
- Modelo SFT derivado: https://huggingface.co/sudhanshu42844/medsparse-healthcare-medical-sft
- Repositorio del proyecto en GitHub: https://github.com/su394611-del/MedSparse-Healthcare-LLM-From-Scratch
- Dataset de preentrenamiento: https://huggingface.co/datasets/common-pile/pubmed_filtered
