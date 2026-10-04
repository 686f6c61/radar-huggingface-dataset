# vaultai/gpt-oss-20b-MXFP4-Q8

## Resumen
vaultai/gpt-oss-20b-MXFP4-Q8 es una redistribucion en formato MLX del modelo de pesos abiertos openai/gpt-oss-20b, publicado por OpenAI. Se trata de una conversion cuantizada que emplea MXFP4 (4 bits) combinado con componentes de 8 bits (Q8), orientada a ejecucion local eficiente en equipos Apple Silicon mediante la libreria mlx-lm (version 0.27.0 en la conversion original). El repositorio tiene un tamano de 12,1 GB y declara 20.914.755.648 parametros totales, es decir, unos 20,9 mil millones.

El modelo conserva la arquitectura de mezcla de expertos (MoE) del modelo base, con un contexto de 128.000 tokens y capacidades de razonamiento, generacion de codigo y llamada a herramientas. Su relevancia actual radica en que permite desplegar un modelo de ~21 B en hardware de consumo Apple Silicon, reduciendo requisitos de memoria frente a los pesos en precision completa, sin salir del ecosistema MLX.

Conviene senalar que este repositorio concreto no anade documentacion propia: su model card es una copia literal de la publicacion de mlx-community/gpt-oss-20b-MXFP4-Q8, por lo que los datos de rendimiento y las limitaciones deben interpretarse a partir del modelo base. La licencia declarada es Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun el modelo base openai/gpt-oss-20b |
| Parametros totales | 20.914.755.648 (~20,9 B) |
| Parametros activos | ~3,6 B (MoE; dato del modelo base openai/gpt-oss-20b) |
| Longitud de contexto | 131.072 tokens (128k; dato del modelo base, no confirmado en la ficha del autor) |
| Tipos de cuantizacion | MXFP4 (4 bits) y Q8 (8 bits); el nombre del repositorio lo indica |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (library_name: mlx) |

Otros datos de la ficha: pipeline text-generation, tamano del repositorio 12,1 GB, 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 4 de octubre de 2026.

## Arquitectura y entrenamiento
La informacion disponible no describe el proceso de entrenamiento de este repositorio, ya que se limita a una conversion de formato. El modelo base openai/gpt-oss-20b es un transformer con mezcla de expertos (MoE) de aproximadamente 21 B de parametros totales y unos 3,6 B activos por token, con un contexto de 128.000 tokens y cuantizacion nativa MXFP4 en los pesos de los expertos. La innovacion principal del modelo base es precisamente el uso de MXFP4 para reducir el coste de memoria manteniendo un comportamiento cercano a precision completa, algo que esta conversion MLX hereda.

La conversion aqui presentada se realizo con mlx-lm 0.27.0, que transforma los pesos de openai/gpt-oss-20b al formato MLX. La combinacion "MXFP4-Q8" del nombre sugiere que las capas de mezcla de expertos se mantienen en 4 bits (MXFP4) mientras que otras capas se cuantizan a 8 bits, aunque la ficha no detalla el esquema exacto por capa. No se documentan en la informacion proporcionada datos sobre el dataset de entrenamiento, numero de tokens, ni si hubo etapas de RLHF o DPO.

## Capacidades
- Generacion de texto y conversacion multi-turno (pipeline declarado: text-generation, conversational).
- Razonamiento paso a paso y resolucion de problemas, heredado del modelo base gpt-oss-20b.
- Generacion de codigo y asistencia en tareas de programacion.
- Soporte de tool calling y function calling, segun las capacidades declaradas del modelo base.
- Uso como nucleo de agentes con razonamiento multi-paso, gracias al contexto de 128k tokens del modelo base.
- Ejecucion local en Apple Silicon a traves de mlx-lm, con integracion del chat_template del tokenizador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento explicito (thinking): no confirmado en la ficha de este repositorio, aunque forma parte del modelo base.

## Casos de uso
- Asistente de programacion local en Mac: con mlx-lm sobre un equipo Apple Silicon, el modelo puede generar y revisar codigo sin enviar datos a la nube, aprovechando el soporte de tool calling para integraciones con editores y terminales.
- Analisis de documentos extensos: la ventana de 128k tokens del modelo base permite resumir informes, contratos o transcripciones largas en una sola pasada, manteniendo coherencia entre secciones.
- Agentes autonomos con herramientas: el soporte de function calling permite construir flujos que consulten APIs, ejecuten comandos o encadenen pasos de razonamiento en local.
- Atencion al cliente asistida: conversaciones multi-turno con contexto largo y ejecucion local, util para prototipos que requieran privacidad de los datos del usuario.
- Prototipado offline y entornos aislados: al ejecutarse en el equipo, es adecuado para demos y pruebas en redes sin conexion o con requisitos de confidencialidad.
- Investigacion y docencia: permite estudiar el comportamiento de un modelo MoE cuantizado de ~21 B en hardware de consumo, comparando la variante MXFP4-Q8 con los pesos originales.
- Generacion de informes y borradores tecnicos: redaccion asistida y reescritura de textos largos con contexto suficiente para no perder el hilo del documento.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Tamano de los pesos: 12,1 GB en disco, segun el repositorio.
- Memoria unificada recomendada en Apple Silicon: aproximadamente 14-16 GB como minimo para el modelo mas la cache KV, y 24-32 GB para contexto largo, aunque no se proporcionan cifras oficiales.
- Chips compatibles: cualquier Apple Silicon (familia M1, M2, M3 o M4) con memoria unificada suficiente; los modelos Pro y Max con 24 GB o mas son la opcion mas comoda.
- GPU dedicadas (NVIDIA, AMD): este repositorio esta en formato MLX, por lo que no se carga directamente con CUDA; requeriria conversion a otro formato o recurrir a la variante equivalente en safetensors o GGUF.
- Opciones de despliegue: mlx-lm (version 0.27.0 o superior) es la via documentada. El tag vllm aparece en los metadatos, pero los pesos son MLX, de modo que vLLM, llama.cpp u Ollama no cargan este repositorio tal cual.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vaultai/gpt-oss-20b-MXFP4-Q8 | ~20,9 B (MoE) | 128k (modelo base) | MXFP4 + Q8 | Apache 2.0 | HuggingFace, formato MLX |
| mlx-community/gpt-oss-20b-MXFP4-Q8 | ~20,9 B (MoE) | 128k (modelo base) | MXFP4 + Q8 | Apache 2.0 | HuggingFace, formato MLX |
| openai/gpt-oss-20b | ~20,9 B (MoE) | 128k | MXFP4 nativo | Apache 2.0 | HuggingFace, pesos originales |
| openai/gpt-oss-120b | ~117 B (MoE) | 128k | MXFP4 nativo | Apache 2.0 | HuggingFace, modelo superior de la familia |

La diferencia practica entre el repositorio de vaultai y el de mlx-community es la procedencia: la model card de vaultai reproduce literalmente la de mlx-community, por lo que todo apunta a una redistribucion de los mismos pesos. Frente a los pesos originales en safetensors, esta version esta optimizada para MLX, mientras que para GPUs conviene usar el modelo base o una variante GGUF.

## Limitaciones y advertencias
- Repositorio sin documentacion propia: la model card es una copia de la de mlx-community, por lo que no hay validacion independiente de la conversion por parte de este autor.
- Procedencia no verificada: se desconoce si los pesos son identicos a los de mlx-community o si hubo alguna modificacion durante la redistribucion.
- Sesgos: no hay informacion especifica en la ficha; deben asumirse los sesgos documentados del modelo base openai/gpt-oss-20b.
- Riesgo de alucinacion: inherente a los modelos generativos, sin datos especificos para esta cuantizacion.
- Cuantizacion: el paso a MXFP4-Q8 puede degradar ligeramente la calidad frente a los pesos originales; no se aportan mediciones.
- Idiomas: los idiomas soportados no estan declarados, por lo que el comportamiento multilingue no esta garantizado.
- Compatibilidad: al ser formato MLX, esta atado a Apple Silicon y a mlx-lm; no es directamente portable a CUDA ni a runtimes de GGUF/GGML.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base por si existieran terminos adicionales.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin senales de mantenimiento ni de comunidad.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/vaultai/gpt-oss-20b-MXFP4-Q8
- Conversion original de mlx-community: https://huggingface.co/mlx-community/gpt-oss-20b-MXFP4-Q8
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Libreria mlx-lm (referenciada en la model card): https://pypi.org/project/mlx-lm/
