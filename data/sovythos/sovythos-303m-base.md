# sovythos/Sovythos-303M-Base

## Resumen

Sovythos-303M-Base (identificado en su model card como SOVYTHOS-V2) es un modelo de lenguaje de tipo decoder-only entrenado desde cero por el proyecto Sovythos AI, publicado por el usuario `sovythos` en Hugging Face. Se presenta como la segunda generación de la familia, tras un modelo base anterior de 66M de parámetros, y su objetivo declarado es ofrecer una base abierta, compatible con el ecosistema Llama/GGUF, para investigacion y ajuste posterior en arabe (arabe estandar moderno y arabe egipcio), ingles y codigo. El checkpoint contiene 336.121.856 parametros reales segun los tensores en safetensors, aunque la model card lo describe como "~300M".

Arquitectonicamente sigue el esquema clasico de Llama: transformer decoder-only denso con RMSNorm pre-normalizacion, RoPE (theta = 1.000.000), Grouped Query Attention con 16 cabezas de consulta y 4 de clave-valor, y capas feed-forward con activacion SwiGLU. Tiene 24 capas, dimension oculta de 1.024, dimension de cabeza 64 y un vocabulario de 32.000 tokens generado con un tokenizer BPE propio orientado a la morfologia del arabe. La longitud de contexto declarada es de 2.048 tokens.

Su relevancia actual es fundamentalmente metodologica y experimental, no de rendimiento: el propio autor advierte de que se trata de un checkpoint temprano de un entrenamiento en curso, sin ajuste por instrucciones ni RLHF, con generaciones debiles o incoherentes y capacidad de seguir instrucciones practicamente nula. Por tanto, resulta util como banco de pruebas de arquitectura, compatibilidad de toolchain (transformers, llama.cpp, GGUF) y como punto de partida para fine-tuning en arabe, mas que como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, estilo Llama (RMSNorm, RoPE, GQA, SwiGLU) |
| Parametros totales | 336.121.856 (dato real de safetensors); la model card indica "~300M" |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | GGUF en F16 y F32 segun la model card; no se documentan cuantizaciones de menor precision (Q4, Q8, etc.) |
| Idiomas soportados | Ingles (en) y arabe (ar), con mencion explicita a arabe egipcio y a lenguajes de programacion |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF (F16 / F32) |
| Dimension oculta | 1.024 |
| Numero de capas | 24 |
| Cabezas de atencion | 16 de consulta / 4 de clave-valor (GQA) |
| Dimension de cabeza | 64 |
| RoPE theta | 1.000.000 |
| Tamano de vocabulario | 32.000 |
| Framework | PyTorch 2.x |
| Etapa de publicacion | Base (pretrained), checkpoint temprano de entrenamiento en curso |
| Tamano del repositorio | 1,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo implementa un stack decoder-only alineado con la especificacion de Llama para facilitar la integracion sin conversiones. Usa RMSNorm pre-atencion y post-atencion sin sesgo ni desplazamiento afinado, RoPE con implementacion `rotate_half` (estilo NEOX) y theta de 1.000.000, GQA con 16 cabezas de consulta frente a 4 de clave-valor (lo que reduce el KV-cache aproximadamente 4x respecto a atencion multi-cabeza estandar) y una red feed-forward con SwiGLU y proyeccion con puerta, con la dimension intermedia redondeada a un multiplo de 256 para aprovechar mejor los kernels de GPU. Los nombres de los tensores (`gate_proj`, `up_proj`, `down_proj`) siguen la convencion de Llama/GGUF. La inicializacion es gaussiana con sigma = 0,02, con escalado de las proyecciones de salida y down-projection por `1/sqrt(2 x capas)`.

El entrenamiento se realiza desde pesos inicializados aleatoriamente (no es un fine-tuning ni una destilacion), sobre un corpus multilingue que abarca arabe estandar moderno, arabe egipcio, ingles y lenguajes de programacion. Las optimizaciones declaradas incluyen `torch.compile` en modo grafo, aceleracion TF32 en Ampere o superior, precision mixta automatica (AMP) con paso forward en fp16, gradient checkpointing para entrenar con contexto largo en GPUs de consumo, acumulacion de gradientes, decaimiento coseno del learning rate con warmup lineal y clipping de gradiente con norma maxima 1,0. El tokenizer es un BPE entrenado especificamente para morfologia arabe, ingles y sintaxis de codigo. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO; la model card indica explicitamente que no ha habido ajuste por instrucciones ni RLHF. Tampoco se detalla el hardware ni la duracion del entrenamiento.

## Capacidades

- Generacion de texto autoregresiva en ingles y arabe (el modelo se distribuye con `pipeline_tag: text-generation` y etiquetas `conversational`).
- Modelado de lenguaje base y continuacion de texto: es un modelo Base, no ajustado por instrucciones, por lo que su uso natural es la prediccion de siguiente token y el fine-tuning.
- Cobertura orientada a arabe egipcio y arabe estandar moderno, ademas de ingles, segun las etiquetas y la descripcion del autor.
- Soporte de codigo como dominio de entrenamiento declarado (la model card lo describe como "Arabic, English, and Code"), aunque sin datos de rendimiento que lo cuantifiquen.
- Compatibilidad directa con el ecosistema Llama/GGUF: se puede cargar con `transformers`, `llama.cpp` y `llama-cpp-python` sin conversiones intermedias.
- Capacidad de usar atencion eficiente en memoria mediante `scaled_dot_product_attention`.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito. No hay indicios de capacidades multimodales.
- El autor advierte que en este checkpoint la capacidad de seguir instrucciones es nula o casi nula.

## Casos de uso

- Punto de partida para fine-tuning en arabe: al ser un modelo Base con licencia Apache 2.0 y 336M de parametros, se puede ajustar con SFT o LoRA sobre datasets en arabe estandar o egipcio para tareas concretas (clasificacion, resumen, generacion de respuestas) sin coste de licencia y con requisitos de hardware modestos.
- Investigacion sobre tokenizers para morfologia arabe: el modelo incorpora un BPE entrenado especificamente para arabe, ingles y codigo, lo que permite estudiar la eficiencia de tokenizacion en una lengua morfologicamente rica comparando ratios de tokens por palabra frente a tokenizers multilingues genericos.
- Validacion de pipelines de despliegue GGUF/llama.cpp: dado que el objetivo declarado del checkpoint es probar la compatibilidad con `transformers` y GGUF, es adecuado como caso de prueba end-to-end de conversion, cuantizacion y carga del modelo en `llama.cpp`, `llama-cpp-python` u Ollama.
- Prototipado de inferencia en CPU o hardware de gama baja: con 336M de parametros, el modelo cabe holgadamente en memoria de sistemas sin GPU, lo que permite experimentar con despliegues en entornos embebidos o servidores sin acelerador.
- Educacion y docencia sobre arquitecturas transformer: al implementar RMSNorm, RoPE, GQA y SwiGLU con nombres de tensores estandar, resulta util para explicar como se construye y entrena un LLM desde cero.
- Investigacion sobre entrenamiento multilingue de bajo coste: sirve como referencia reproducible para estudiar el efecto de la mezcla de idiomas (arabe, ingles, codigo) en un presupuesto de calculo pequeno.
- Base para modelos de dominio especifico por adaptacion ligera: por ejemplo, ajuste con LoRA para dominios tecnicos en arabe donde no existe un modelo abierto especifico.
- No se recomienda su uso directo en atencion al cliente, generacion de codigo en produccion ni agentes autonomos en este estado del entrenamiento, ya que el autor advierte de generaciones debiles o incoherentes y ausencia de ajuste por instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y el autor indica que la loss de validacion sigue descendiendo activamente. Tampoco se han encontrado resultados de benchmarks en los resultados de busqueda web disponibles, que no guardan relacion con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en fp16 (336M parametros x 2 bytes) y en torno a 1,3 GB en fp32, que coincide con el tamano del repositorio (1,3 GB, consistente con pesos en precision completa). Con cuantizacion a 8 bits el peso bajaria a unos 0,35 GB, aunque la model card solo documenta GGUF en F16 y F32.
- KV-cache: con 24 capas, 4 cabezas KV de dimension 64 y contexto de 2.048 tokens, el cache ocupa del orden de decenas de MB en fp16 (4 x 64 x 24 x 2 tensores x 2 bytes x 2.048 tokens), por lo que no es un factor limitante.
- GPU recomendadas: cualquier GPU con mas de 2 GB de VRAM es suficiente. El modelo cabe sin problema en RTX 3060, RTX 4060, RTX 4090, A100 o H100, aunque estas dos ultimas estarian ampliamente sobredimensionadas. Tambien es viable la inferencia en CPU.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo modernas, y tambien en CPU y en entornos sin acelerador.
- Opciones de despliegue: `transformers` (PyTorch 2.x, compatibilidad Llama), `llama.cpp`, `llama-cpp-python`, Ollama mediante los ficheros GGUF, y servidores compatibles con arquitectura Llama como vLLM o TGI, siempre que admitan la configuracion de 24 capas y contexto de 2.048 sin modificaciones.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada no incluye benchmarks ni especificaciones de modelos comparables, y los resultados de busqueda web no aportan datos relevantes. La siguiente tabla recoge unicamente caracteristicas estructurales basicas de alternativas de tamano similar, tomadas de la documentacion publica de cada proyecto y sujetas a verificacion en sus respectivas model cards.

| Modelo | Parametros | Contexto | Licencia | Idiomas destacados | Disponibilidad |
|---|---|---|---|---|---|
| Sovythos-303M-Base | 336M (declarado ~300M) | 2.048 tokens | Apache 2.0 | Arabe (MSA y egipcio), ingles, codigo | Safetensors y GGUF; 0 descargas |
| TinyLlama-1.1B | ~1,1B | 2.048 tokens | Apache 2.0 | Ingles principalmente | Ampliamente desplegado, con versiones GGUF |
| Qwen2.5-0.5B | ~0,49B | 32.768 tokens | Apache 2.0 (segun variante) | Multilingue amplio, con arabe | Ampliamente desplegado |
| SmolLM2-360M | ~362M | 8.192 tokens | Apache 2.0 | Ingles principalmente | Ampliamente desplegado |

Nota: los datos de las alternativas no forman parte de la informacion proporcionada para este modelo y deben contrastarse con sus model cards oficiales antes de tomar decisiones. En particular, Sovythos-303M-Base se distingue por su enfasis declarado en arabe egipcio y por ser un checkpoint temprano sin ajuste por instrucciones, lo que limita cualquier comparacion de rendimiento.

## Limitaciones y advertencias

- Checkpoint temprano: el autor indica explicitamente que es una instantanea de un entrenamiento en curso y no la version final de SOVYTHOS-V2. Se deben esperar generaciones debiles o incoherentes en muchas peticiones.
- Sin ajuste por instrucciones ni RLHF: es un modelo Base, por lo que no sigue instrucciones y no es adecuado para uso conversacional directo sin fine-tuning previo.
- Loss de validacion aun descendiendo: el autor senala que la calidad mejorara sustancialmente con entrenamiento adicional, lo que implica que las metricas actuales no son representativas del objetivo final.
- Riesgo de alucionacion: al ser un modelo de lenguaje base sin alineamiento, la generacion de contenido factualmente incorrecto es esperable y no hay mecanismos de mitigacion documentados.
- Ausencia de alineamiento de seguridad: al no haber RLHF ni fases de alineamiento, no se han aplicado filtros de contenido ni salvaguardas frente a usos daninos.
- Limitacion de contexto: la ventana de 2.048 tokens es reducida frente a estandares actuales (32K o mas en modelos comparables), lo que restringe tareas de contexto largo, resumen de documentos extensos o conversaciones multi-turno prolongadas.
- Cobertura de idiomas limitada a ingles y arabe: no se documenta soporte para castellano ni para otras lenguas, y no se especifica el equilibrio real de la mezcla de datos entre idiomas.
- Inexistencia de datos de rendimiento: sin benchmarks publicados, no es posible estimar la calidad relativa frente a alternativas de tamano similar.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia externa de funcionamiento correcto ni de reproducibilidad.
- Inconsistencia documental a revisar: la imagen referenciada en la model card apunta a la ruta `my0919175/Sovythos-303M-Base`, distinta del identificador del repositorio `sovythos/Sovythos-303M-Base`. Conviene verificar la ubicacion real de los artefactos antes de integrarlos en un pipeline.
- Diferencias entre parametros declarados y reales: la model card indica "~300M" mientras que los tensores en safetensors suman 336.121.856 parametros. Para estimaciones de memoria conviene usar el dato real.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y licencia y se indiquen los cambios realizados. No se declaran restricciones adicionales de uso aceptable mas alla de las de la propia licencia.
- Uso en produccion: desaconsejado en el estado actual del checkpoint para cualquier tarea que requiera calidad o fiabilidad, incluidos atencion al cliente, generacion de codigo o agentes autonomos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sovythos/Sovythos-303M-Base
- Imagen referenciada en la model card: https://huggingface.co/my0919175/Sovythos-303M-Base/resolve/main/sovythos.png (ruta distinta del identificador del repositorio; verificar)
- Cuaderno de Google Colab mencionado en el indice de la model card: no disponible (la seccion esta truncada y no se incluye la URL)
- Paper, blog tecnico o repositorio de codigo del proyecto Sovythos AI: no disponible en la informacion proporcionada
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las busquedas devuelven unicamente paginas corporativas de Microsoft sin relacion con el modelo
