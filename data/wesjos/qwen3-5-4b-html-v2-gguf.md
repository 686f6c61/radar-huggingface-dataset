# wesjos/Qwen3.5-4B-HTML-v2-GGUF

## Resumen

Qwen3.5-4B-HTML-v2-GGUF es la distribucion en formato GGUF del modelo wesjos/Qwen3.5-4B-HTML-v2, un ajuste fino supervisado sobre Qwen/Qwen3.5-4B orientado a la generacion de interfaces HTML autocontenidas. El autor, wesjos, publica tanto los pesos originales como esta compilacion cuantizada para llama.cpp, con un proyector visual independiente que habilita la entrada de imagenes. El modelo resuelve un problema concreto: convertir una peticion en lenguaje natural (o una captura de pantalla) en un fragmento HTML estructurado con un contrato de clases CSS fijo, en lugar de texto libre.

La arquitectura subyacente es `Qwen3_5ForConditionalGeneration`, con 32 capas (24 de atencion lineal y 8 de atencion completa), anchura oculta de 2560 y una ventana de contexto nativa de 262.144 tokens. Los pesos declarados en safetensors suman 4.205.751.296 parametros (4,2 B), mientras que la model card del autor cita 4,66 B en bf16 para el modelo base, una discrepancia atribuible a la cuantizacion o al conteo del checkpoint original.

Su relevancia practica esta en el formato de salida: el modelo emite un arbol DOM con clases semanticas (`ai-view`, `summary-card`, `grid-2`, `metric-card`, `callout-info`, etc.) que la WebUI incluida renderiza directamente. El ajuste se realizo sobre el dataset wesjos/mario-html-sft y la version v2 reduce la presencia de etiquetas HTML dentro del bloque de razonamiento respecto a v1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer hibrido: 24 capas de atencion lineal + 8 de atencion completa), 32 capas, hidden 2560 |
| Parametros totales | 4.205.751.296 (safetensors); la model card cita 4,66 B en bf16 para el base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | Q8_0 (4,17 GiB), Q4_K_M (2,52 GiB), proyector visual F16-mmproj (641 MiB) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |
| Modalidades | texto → HTML; texto + imagen → HTML |
| Tamano del repositorio | 7,9 GB |
| Descargas / likes | 300 / 2 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer hibrido que combina 24 capas de atencion lineal con 8 capas de atencion completa sobre una dimension oculta de 2560. Esta mezcla reduce el coste cuadratico del mecanismo de atencion en secuencias largas, lo que explica la ventana nativa de 262.144 tokens. El pipeline declarado es `image-text-to-text`, de modo que el modelo conserva la torre visual del base y la expone mediante un proyector multimodal separado en el paquete GGUF.

El ajuste fino se realizo sobre el dataset wesjos/mario-html-sft, un conjunto SFT propio del autor orientado a la generacion de paginas HTML con clases CSS predefinidas. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO. La model card indica que la v2 contiene menos etiquetas HTML dentro del bloque de razonamiento que la v1, lo que sugiere un trabajo de limpieza de las trazas de cadena de pensamiento durante el ajuste. El modelo emite trazas `<think>` en texto plano (sin HTML) seguidas del documento final, un patron que el autor documenta explicitamente con una muestra cruda generada en modo greedy y sin system prompt.

## Capacidades

- Generacion de HTML estructurado conforme a un contrato de clases fijo: raiz `ai-view`, resumen con `summary-card` y `lead`, rejillas `grid-2` y `grid-3`, tarjetas de metrica, steppers, callouts, badges, tablas y bloques de codigo.
- Razonamiento explicito mediante bloque `<think>` previo a la respuesta, activable o desactivable en la WebUI (`enable_thinking`).
- Entrada de imagenes: con el proyector `F16-mmproj.gguf` cargado, acepta imagen + instruccion y devuelve HTML, lo que cubre el caso de replicar o reinterpretar una interfaz a partir de una captura.
- Capacidades de visual question answering heredadas del modelo base y anotadas en los tags del repositorio.
- Conversacion multiturno: el tag `conversational` y la sesion de demostracion de 67 segundos con tres turnos encadenados (calculo aritmetico, saludo y consulta en chino) confirman el soporte.
- Multilinguismo limitado a ingles y chino; la demo incluye respuestas en chino con el mismo contrato HTML.
- Calculo aritmetico basico dentro de la conversacion (el ejemplo `8.2x9.12/2.3` aparece en la grabacion de demostracion).
- No se documenta soporte de tool calling ni de function calling en la informacion disponible.

## Casos de uso

- Generacion de prototipos de interfaz: dada una descripcion textual de una pantalla, el modelo emite HTML con clases ya estilizadas por `theme.css`, lo que permite pasar de la idea al prototipo renderizado sin escribir marcado a mano.
- Reconstruccion de UI a partir de capturas: cargando el proyector visual, una imagen de una pantalla existente se convierte en HTML editable con la jerarquia de tarjetas y rejillas del contrato, util para migraciones o para documentar interfaces legacy.
- Paneles de resumen para agentes: el contrato incluye `metric-card`, `callout` y `modern-table`, de modo que un orquestador puede pedir al modelo un informe visual de resultados (por ejemplo, metricas de un pipeline) listo para incrustar en una consola interna.
- Documentacion tecnica con formato enriquecido: el bloque `code-box` con `code-title` permite generar guias con fragmentos de codigo, pasos numerados en `stepper` y avisos en `callout-warning`, adecuado para bases de conocimiento internas.
- Asistente conversacional con salida visual: la sesion de demo encadena preguntas heterogeneas manteniendo el mismo formato de respuesta, lo que sirve para bots donde cada respuesta debe renderizarse como una tarjeta y no como texto plano.
- Generacion bilingue EN/ZH para productos con mercado en ambos idiomas: la demo en chino produce el mismo arbol de clases que la version inglesa, lo que simplifica el mantenimiento de una unica hoja de estilos.
- Despliegue en local con llama.cpp: al estar cuantizado en Q4_K_M (2,52 GiB) y Q8_0 (4,17 GiB), puede servirse desde una estacion de trabajo sin GPU dedicada de gran tamano y consumirse mediante un endpoint compatible con OpenAI (`http://127.0.0.1:18086`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas de calidad de HTML generado, y la busqueda web no aporta cifras del modelo base Qwen/Qwen3.5-4B utilizables aqui.

## Requisitos de hardware

- VRAM estimada: en Q4_K_M, aproximadamente 2,5-3,5 GB incluyendo overhead de contexto; en Q8_0, aproximadamente 4,2-5,5 GB. El proyector visual anade unos 641 MiB.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090 24 GB; en Q4_K_M es viable en tarjetas de 6-8 GB con contexto moderado.
- GPU de datacenter: A100 y H100 no son necesarias para este tamano; resultan utiles solo para servir muchas peticiones concurrentes con contexto largo.
- Contexto largo: los 262.144 tokens nativos no caben en VRAM consumer con KV cache completo; en la practica conviene limitar el contexto a unos miles de tokens para generacion de HTML.
- Despliegue: llama.cpp (`llama serve -hf wesjos/Qwen3.5-4B-HTML-v2-GGUF:Q8_0`), con `--mmproj mario-html-v2-4B.F16-mmproj.gguf` para entrada de imagen. La WebUI incluida se arranca con `python server.py --port 8791` y apunta por defecto a `http://127.0.0.1:18086`.
- Advertencia de nombres: el fichero del proyector no sigue la convencion `mmproj-*.gguf`, por lo que la autodeteccion de llama.cpp no lo localizara; hay que pasarlo de forma explicita.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wesjos/Qwen3.5-4B-HTML-v2-GGUF | 4,2 B (safetensors) | 262.144 | texto + imagen → HTML | Apache 2.0 | GGUF en HF, 300 descargas |
| Qwen/Qwen3.5-4B (base) | no disponible con precision (la card del derivado cita 4,66 B bf16) | 262.144 | image-text-to-text generico | no disponible en la informacion | HF oficial |
| wesjos/Qwen3-4B-humanlike-GGUF | no disponible | no disponible | texto | no disponible en la informacion | GGUF en HF |

El modelo se distingue de su base por el ajuste SFT sobre un dataset propio y por un contrato de salida cerrado, no por capacidades generales adicionales; el base conserva el uso conversacional generico. Frente a Qwen3-4B-humanlike-GGUF, del mismo autor, la diferencia es de especializacion: aquel apunta a estilo conversacional y este a generacion de interfaz. No se dispone de cifras de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Idiomas: solo ingles y chino declarados; el castellano no esta soportado de forma explicita y la calidad del HTML generado a partir de instrucciones en espanol no esta validada.
- Especializacion estrecha: el ajuste esta orientado a un contrato de clases concreto; fuera de ese contrato el modelo puede producir HTML valido pero sin el estilo esperado por `theme.css`.
- Clases sin estilo: `step-list` y `ai-view-header` aparecen en las muestras del autor pero no existen en `theme.css`, por lo que se renderizan con estilo de bloque por defecto.
- Alucinacion: no hay evaluacion publicada de fidelidad factual; en tareas de VQA sobre capturas puede inventar contenido no presente en la imagen.
- Configuracion inconsistente en el paquete: `webui/config.json` apunta a `./model.q8_0.gguf`, mientras que el fichero real del repositorio es `../mario-html-v2-4B.Q8_0.gguf`; hay que corregir la ruta antes de arrancar.
- `enable_thinking` viene desactivado por defecto en la WebUI, lo que oculta el panel de razonamiento; para reproducir las demos hay que activarlo.
- Modelo de 4 B de parametros: la calidad en razonamiento complejo, matematicas no triviales y generacion de codigo extenso es limitada en comparacion con modelos mayores, y no se han publicado benchmarks que la cuantifiquen.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se publica con 2 likes y 300 descargas, lo que implica una validacion comunitaria muy escasa.
- No se documenta soporte de tool calling, por lo que no debe asumirse su uso en pipelines de agentes que dependan de function calling.

## Enlaces

- Repositorio GGUF: https://huggingface.co/wesjos/Qwen3.5-4B-HTML-v2-GGUF
- Modelo base del ajuste: https://huggingface.co/wesjos/Qwen3.5-4B-HTML-v2
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/wesjos/mario-html-sft
- Otro modelo del mismo autor: https://huggingface.co/wesjos/Qwen3-4B-humanlike-GGUF
- Fichero Q8_0: https://huggingface.co/wesjos/Qwen3.5-4B-HTML-v2-GGUF/resolve/main/mario-html-v2-4B.Q8_0.gguf
- Fichero Q4_K_M: https://huggingface.co/wesjos/Qwen3.5-4B-HTML-v2-GGUF/resolve/main/mario-html-v2-4B.Q4_K_M.gguf
- Proyector visual: https://huggingface.co/wesjos/Qwen3.5-4B-HTML-v2-GGUF/resolve/main/mario-html-v2-4B.F16-mmproj.gguf
- Video de demostracion: https://huggingface.co/wesjos/Qwen3.5-4B-HTML-v2-GGUF/resolve/main/demo/01-webui-session.mp4
