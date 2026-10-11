# summerMC/Cyber-9B-Qwen

## Resumen

Cyber-9B-Qwen es un repositorio de pesos en formato GGUF publicado por el usuario summerMC el 11 de octubre de 2026. No es un modelo entrenado desde cero: se trata de una re-cuantizacion a Q4_0 del modelo `DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP`, un ajuste fino de 9B derivado de la arquitectura Qwen3.5 de Alibaba. El objetivo declarado es permitir la ejecucion local del modelo en hardware de consumo a traves de llama.cpp y sus derivados (LM Studio, Ollama), con un fichero principal de 5,45 GB.

El repositorio incluye ademas un proyector multimodal BF16 (`mmproj`) de 922 MB, lo que habilita la entrada de imagenes mediante `llama-mtmd-cli`, y un JSON con metadatos de exportacion. La model card esta redactada en japones y no documenta la longitud de contexto nativa, los idiomas soportados, la composicion del dataset de entrenamiento ni resultados de evaluacion.

Su relevancia es limitada pero concreta: al ser un derivado sin censura (uncensored) cuantizado a Q4_0, resulta util para experimentacion local con privacidad, red teaming y estudio de la degradacion introducida por la cuantizacion, mas que para despliegues de produccion. El repositorio acumula 0 descargas y 0 likes y no tiene pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (arquitectura exacta no declarada en la model card) |
| Parametros totales | 9B segun el autor; los metadatos de HuggingFace sobre pesos safetensors indican 456.010.480 parametros (dato inconsistente con el nombre del modelo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (los ejemplos de la model card arrancan llama.cpp con `-c 8192`, valor de configuracion en tiempo de ejecucion, no una especificacion del modelo) |
| Tipos de cuantizacion | Q4_0 (unico cuantizado publicado); proyector multimodal mmproj en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF para llama.cpp; proyector multimodal en GGUF BF16 |
| Modelo base | DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP |
| Modalidad | Texto e imagen (la imagen requiere cargar el fichero mmproj) |
| Tamano del repositorio | 6,4 GB |
| Ficheros | `...Q4_0.gguf` (5,45 GB), `...BF16-mmproj.gguf` (922 MB), `export_metadata.json` (240 B) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna mas alla de su ascendencia Qwen3.5. Lo que se publica es un proceso de exportacion y cuantizacion, no de entrenamiento: el autor toma el modelo de 9B de DavidAU, ya derivado de la familia Qwen3.5, y lo convierte a Q4_0 mediante la cadena de herramientas de llama.cpp. No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el ajuste fino original uso RLHF, DPO u otra tecnica de alineacion. La model card indica que la base es un derivado "uncensored", es decir, con los filtros de seguridad debilitados respecto al modelo original.

El unico componente adicional con entidad propia es el proyector multimodal BF16, que actua como adaptador entre un codificador visual y el modelo de lenguaje; su presencia implica que el modelo base incorpora una torre de vision, aunque el repositorio no detalla ni el codificador ni la resolucion de imagen soportada. El autor advierte de que se requiere una version reciente de llama.cpp compatible con la arquitectura Qwen3.5 para cargar los pesos correctamente.

## Capacidades

- Generacion de texto conversacional y continuacion de texto libre en un unico turno o en conversaciones multi-turno.
- Entrada de imagenes: con el fichero `mmproj` cargado, permite describir o razonar sobre imagenes proporcionadas localmente (`llama-mtmd-cli --image`).
- Salida sin filtros de seguridad heredada del modelo base, orientada a contenido creativo, roleplay y escenarios que los modelos alineados rechazan.
- Ejecucion completamente local y offline, incluyendo el procesamiento de imagenes, sin llamadas a APIs externas.
- Inferencia en CPU o GPU mediante llama.cpp, con aceleracion total por GPU (`-ngl 99`).
- Exposicion como API compatible con OpenAI a traves de `llama-server` en el puerto 8080.
- Soporte de tool calling / function calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso explicito: no disponible.
- Modo de razonamiento (thinking mode): no disponible.
- Capacidades multilingues: no disponible; el unico indicio es que la model card esta escrita en japones, sin que se declaren idiomas soportados.

## Casos de uso

- Prototipado en hardware modesto: con 5,45 GB de pesos en Q4_0, el modelo se puede cargar en equipos con 8 GB de VRAM o incluso en CPU con 8 GB de RAM, lo que permite probar un modelo de 9B sin acceso a GPU de datacenter.
- Escritura creativa sin restricciones: al ser un derivado uncensored, resulta adecuado para generar narrativa de ficcion, dialogos de personaje y contenido de genero que los modelos alineados tienden a rechazar; se ejecutaria con `llama-cli` en modo conversacional.
- Analisis de imagenes en local: cargando el `mmproj` con `llama-mtmd-cli` se pueden describir capturas, diagramas o fotografias sin enviar los ficheros a un servicio externo, util en entornos con requisitos de confidencialidad.
- Despliegue de una API de pruebas interna: `llama-server` levanta un endpoint compatible con OpenAI, lo que permite apuntar clientes y SDK ya existentes contra el modelo para validar integraciones sin coste de tokens.
- Red teaming y evaluacion de seguridad: sirve como sujeto de prueba para medir la eficacia de filtros, clasificadores de contenido y guardarrailes externos frente a un modelo deliberadamente sin censura.
- Estudio de degradacion por cuantizacion: comparar las respuestas de este Q4_0 con las del modelo base en BF16 permite cuantificar la perdida de calidad en tareas concretas, un dato relevante para decidir que cuantizacion usar en produccion.
- Procesamiento de documentos sensibles en entornos air-gapped: al no requerir conexion a internet, se puede usar para resumir o clasificar texto e imagenes en maquinas aisladas de la red.
- Asistente de rol y chat de acompanamiento: la combinacion de contexto configurable y ausencia de censura lo hace adecuado para bots de personaje en aplicaciones de entretenimiento, siempre que el despliegue incluya sus propios filtros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye puntuaciones de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y no se dispone de comparaciones medidas contra el modelo base en BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5 GB para los pesos Q4_0, mas la cache KV correspondiente al contexto configurado; en torno a 6,4 GB si se carga tambien el proyector multimodal BF16.
- El autor recomienda un minimo de 8 GB de VRAM o de memoria RAM para absorber pesos, proyector y contexto.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En tarjetas de 8 GB entra justo y obliga a limitar la longitud de contexto.
- GPU de datacenter: A100, H100 o similares no son necesarias para este modelo; solo tendrian sentido para servir muchas instancias en paralelo.
- Inferencia en CPU: soportada, con degradacion de velocidad. Se puede forzar con `-ngl 0`; se recomienda un minimo de 8 GB de RAM y, preferiblemente, 16 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-mtmd-cli`), LM Studio y Ollama. El soporte en vLLM o TGI no esta confirmado para este repositorio, ya que ambos dan soporte limitado a GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|---|
| summerMC/Cyber-9B-Qwen | 9B (dato declarado) | no disponible | GGUF Q4_0 + mmproj BF16 | Apache-2.0 | no disponible | Cuantizacion de un derivado uncensored con vision; 0 descargas |
| DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP | 9B | no disponible | no disponible | no disponible | no disponible | Modelo base sin cuantizar del que procede este repositorio |
| summerMC/Qwen3.5-9B-SpeedX9-GDN32-x2 | 9B | no disponible | safetensors (Transformers, custom_code) | no disponible | Ingles y japones | Variante del mismo autor sobre Qwen3.5 con atencion lineal recurrente (arquitectura qwen3_5_gdn24) |
| summerMC/summer_cyber | 7,6B | 32768 tokens | no disponible | no disponible | no disponible | Fine-tune de Qwen2.5 con Unsloth y TRL sobre `unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit` |

No se dispone de modelos comparables con datos de rendimiento publicados en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto y formato.

## Limitaciones y advertencias

- Modelo derivado de una base "uncensored": la propia model card advierte de que las salidas no estan filtradas y pueden ser inapropiadas, inexactas o daninas. No debe exponerse directamente a usuarios finales sin capas de moderacion propias.
- Riesgo de alucinacion: la model card indica explicitamente que no se garantiza la factualidad de las respuestas. No debe usarse para decisiones medicas, legales, financieras o de seguridad sin verificacion por un profesional.
- Degradacion por cuantizacion: el formato Q4_0 reduce la calidad respecto al modelo en BF16. El autor lo reconoce como una perdida "ligera", pero no cuantifica el efecto en ninguna tarea concreta.
- Discrepancia en el recuento de parametros: los metadatos de HuggingFace indican 456.010.480 parametros para los pesos safetensors, frente a los 9B declarados en la model card y en el nombre del modelo. Conviene verificar el contenido real del repositorio antes de planificar un despliegue.
- Contexto no especificado: no se declara la ventana de contexto nativa. El valor `-c 8192` de los ejemplos es una eleccion del autor al lanzar llama.cpp, no una caracteristica del modelo, por lo que no se puede asumir que admita conversaciones largas sin probarlo.
- Idiomas no declarados: no hay informacion sobre el rendimiento en castellano ni sobre la cobertura multilingue real.
- Compatibilidad de runtime: requiere una version reciente de llama.cpp con soporte para la arquitectura Qwen3.5. Versiones antiguas fallaran al cargar el modelo.
- Licencia: los pesos se publican bajo Apache-2.0, pero el uso queda sujeto tambien a las condiciones del modelo base de DavidAU y de los modelos Qwen subyacentes. Conviene revisar esas licencias antes de un uso comercial.
- Madurez del repositorio: 0 descargas, 0 likes, sin pipeline declarado y publicado y actualizado el mismo dia (11 de octubre de 2026). No hay validacion por parte de la comunidad ni evaluaciones de seguridad independientes.
- Advertencia de uso: el autor prohibe explicitamente el uso para actividades ilegales, dano a terceros, acoso o suplantacion de identidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/summerMC/Cyber-9B-Qwen
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Perfil del autor en HuggingFace: https://huggingface.co/summerMC
- Perfil del autor del modelo base: https://huggingface.co/DavidAU
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Variante relacionada del mismo autor: https://huggingface.co/summerMC/Qwen3.5-9B-SpeedX9-GDN32-x2
- Otro modelo del mismo autor: https://huggingface.co/summerMC/summer_cyber
- Ficha de Qwen3.5-9B (especificaciones y requisitos de VRAM): https://apxml.com/models/qwen35-9b
