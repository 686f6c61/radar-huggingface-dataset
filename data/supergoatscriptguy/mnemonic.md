# SuperGoatScriptGuy/Mnemonic

## Resumen

Mnemonic 126M es un modelo de lenguaje de tipo chat desarrollado por SuperGoatScriptGuy cuya particularidad no es el rendimiento, sino la implementación: todo el ciclo completo (pipeline de datos, tokenizador, entrenamiento en GPU, cuantización e inferencia) está escrito a mano en ensamblador. La parte de CPU usa x86-64 con NASM, la de GPU emplea PTX escrito manualmente y en el navegador se ejecuta mediante WebAssembly.

El modelo es un decoder de estilo Llama de 126 millones de parámetros, con 16 capas, dimensión de modelo 768, 12 cabezas de consulta y 4 de clave-valor, SwiGLU con dimensión de feed-forward 2048, RoPE, RMSNorm y embeddings atados. El contexto es de 1024 tokens y el vocabulario es un BPE a nivel de byte de 32768 entradas.

Su relevancia es principalmente didactica y de ingenieria de bajo nivel: demuestra que es viable entrenar y servir un modelo conversacional funcional sin frameworks de alto nivel, con pesos que ocupan entre 75 MB (int4) y 121 MB (int8). Publicado bajo el identificador SuperGoatScriptGuy/Mnemonic, acumula 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validacion externa de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (16 capas, d_model 768, 12 cabezas query / 4 cabezas key-value, SwiGLU con ffn 2048, RoPE, RMSNorm, embeddings atados, sin biases) |
| Parametros totales | 126M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | int8 con una escala por fila; int4 con una escala por grupo de 32 |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | .mnm (formato propio del proyecto: cabecera de 4 KB seguida de los tensores); no es un checkpoint de transformers |
| Vocabulario | BPE a nivel de byte, 32768 entradas |
| Tamano de los pesos | 121 MB (int8), 75 MB (int4) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder estandar de la familia Llama, sin modificaciones estructurales: 16 capas, dimensión de modelo 768, atención con 12 cabezas de consulta y 4 cabezas de clave/valor (atención con consultas agrupadas), bloque SwiGLU de dimensión 2048, codificación posicional rotatoria (RoPE), normalización RMSNorm, embeddings atados entre entrada y salida y ninguna capa de sesgo. La ventana de contexto es de 1024 tokens, corta en comparación con modelos actuales de tamaño similar.

El entrenamiento se dividió en dos fases: un preentrenamiento sobre 5000 millones de tokens (5B) del dataset FineWeb-Edu, ejecutado en una única RTX 5070 Ti durante 19 horas, seguido de un ajuste fino para chat sobre smol-smoltalk más un pequeño conjunto de identidad. No se documenta en la informacion disponible el uso de RLHF, DPO u otra técnica de alineación adicional. La innovación técnica destacable no está en el modelo sino en la implementación: tokenizador, pipeline, entrenamiento, cuantización e inferencia escritos a mano en ensamblador (x86-64 con NASM, PTX en GPU y WebAssembly en navegador), lo que constituye un caso poco habitual de proyecto de extremo a extremo sin dependencias de frameworks de ML.

## Capacidades

- Generacion de texto autoregresiva en ingles, con modo conversacional obtenido mediante ajuste fino sobre smol-smoltalk.
- Conversaciones de multiples turnos, limitadas por una ventana de contexto de solo 1024 tokens.
- Conjunto de identidad propio: el modelo ha sido ajustado con un pequeño set para responder sobre si mismo.
- Ejecucion en CPU mediante el motor en ensamblador x86-64 del repositorio (chat/engine.asm).
- Ejecucion en GPU mediante PTX escrito a mano.
- Ejecucion en navegador mediante WebAssembly (site/engine.wat).
- Cuantizacion a int8 e int4 con esquemas propios de escalas (por fila y por grupo de 32).
- No se documenta soporte de tool calling / function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta soporte de vision, audio ni ninguna otra modalidad.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Chat local en el navegador: el motor en WebAssembly (site/engine.wat) permite cargar los pesos int4 (75 MB) y mantener conversaciones sin enviar datos a ningun servidor, con privacidad total para el usuario.
- Material didactico de ingenieria de bajo nivel: el repositorio sirve para estudiar como se implementa un tokenizador BPE, un bucle de entrenamiento y un kernel de atención en NASM y PTX sin capas de abstraccion.
- Inferencia en hardware muy limitado: con 75 MB en int4, el modelo puede ejecutarse en dispositivos de borde, sistemas embebidos con CPU x86-64 o equipos sin GPU dedicada donde no caben modelos de mayor tamano.
- Prototipado de asistentes conversacionales sencillos: la ventana de 1024 tokens es suficiente para dialogos de soporte acotados, formularios guiados o asistentes de una sola tarea, siempre en ingles.
- Banco de pruebas de cuantizacion: al ofrecer dos esquemas distintos (int8 por fila e int4 por grupo de 32), permite comparar el impacto de la precision sobre la calidad de salida en un modelo pequeño y reproducible.
- Experimentacion academica sobre formatos propios de pesos: el formato .mnm, con cabecera de 4 KB y tensores a continuacion, es un ejemplo util para estudiar el diseno de un formato de serializacion minimo.
- Generacion de texto de bajo coste para pipelines de datos: por su tamano, puede usarse como generador auxiliar en tareas de etiquetado o aumento de datos donde no se requiere alta calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y no se han encontrado resultados en la busqueda web.

## Requisitos de hardware

- VRAM para inferencia: muy reducida. Los pesos ocupan 121 MB en int8 y 75 MB en int4, y la cache KV es minima (16 capas, 4 cabezas key-value, dimension de cabeza 64, 1024 tokens), por lo que el modelo cabe holgadamente en menos de 1 GB de memoria en cualquier configuracion.
- GPU: el entrenamiento se realizo en una unica RTX 5070 Ti. Cualquier GPU moderna con soporte para PTX puede ejecutar la inferencia; no se especifican modelos concretos recomendados.
- Consumer GPU: si, cabe en cualquier GPU de consumo e incluso en graficas integradas o en CPU sin acelerador dedicado.
- Opciones de despliegue: el modelo no es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers, ya que usa un formato propietario .mnm que solo leen los motores incluidos en el repositorio (chat/engine.asm para CPU x86-64 y site/engine.wat para WebAssembly). Cualquier despliegue requiere compilar esos motores.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. A continuacion se ofrece una comparacion orientativa con alternativas de tamano equivalente de conocimiento general; los datos de los modelos de la competencia no proceden de la busqueda realizada y deberian verificarse en sus fichas oficiales.

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Mnemonic 126M | 126M | 1024 | no disponible | .mnm, motores propios en ensamblador | Implementacion integra en ensamblador; sin benchmarks publicados |
| SmolLM2-135M | 135M | 8192 (segun su ficha) | Apache 2.0 (segun su ficha) | safetensors, transformers, llama.cpp | El dataset smol-smoltalk usado para el ajuste de Mnemonic proviene de esta familia |
| Qwen2.5-0.5B | 494M | 32768 (segun su ficha) | Apache 2.0 (segun su ficha) | safetensors, transformers, llama.cpp, vLLM | Mayor tamano y contexto; ecosistema de despliegue estandar |
| TinyLlama-1.1B | 1,1B | 2048 (segun su ficha) | Apache 2.0 (segun su ficha) | safetensors, transformers, llama.cpp | Tamano muy superior; no compite en la misma franja de memoria |

## Limitaciones y advertencias

- El propio autor reconoce que es un modelo pequeño: comete errores con seguridad excesiva (alucinaciones confiadas), es debil en matematicas y pierde el hilo en conversaciones largas.
- La ventana de contexto es de solo 1024 tokens, lo que limita drasticamente cualquier tarea que requiera documentos extensos o historiales de dialogo largos.
- Solo soporta ingles; no hay evidencia de capacidades multilingues ni de castellano.
- La licencia no esta disponible, por lo que no puede asumirse permiso para uso comercial. Es imprescindible contactar con el autor antes de integrarlo en produccion.
- El formato .mnm es propietario y no es compatible con el ecosistema estandar (transformers, GGUF, ONNX). Requiere compilar y mantener los motores en ensamblador del repositorio, lo que complica el despliegue, la portabilidad y el soporte a largo plazo.
- No existe soporte documentado de tool calling, function calling ni flujos de agente, lo que descarta su uso en automatizaciones que dependan de invocacion de herramientas.
- Con 0 descargas y 0 likes, no hay validacion independiente de la calidad, la reproducibilidad ni la seguridad del modelo.
- No se han publicado benchmarks, por lo que cualquier evaluacion de rendimiento debe hacerse por cuenta propia.
- Advertencia de confusion de nombres: en la busqueda web aparecen otros proyectos llamados "mnemonic" (el servidor MCP de memoria en git de danielmarbach y MnemonicAI/Aria) y una cuenta de Ollama con el mismo nombre de usuario. Ninguno de ellos esta relacionado con este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SuperGoatScriptGuy/Mnemonic
- Repositorio en GitHub: https://github.com/Supergoatscriptguy/Mnemonic
- Perfil de GitHub del autor: https://github.com/Supergoatscriptguy/
- Motor de chat en CPU (ruta dentro del repositorio): chat/engine.asm
- Motor en WebAssembly (ruta dentro del repositorio): site/engine.wat
- Paper o publicacion tecnica: no disponible
- Demo alojada: no disponible
- Otros proyectos no relacionados con el mismo nombre: https://danielmarbach.github.io/mnemonic/ y http://mnemonicai.org/
