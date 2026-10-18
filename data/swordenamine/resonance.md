# swordenamine/resonance

## Resumen

`swordenamine/resonance` no es un modelo de lenguaje: es una herramienta de línea de comandos publicada en HuggingFace que convierte una conversación lineal con una API de IA en un árbol de conocimiento navegable y ramificable. El repositorio (0 descargas y 0 likes en el momento de la consulta, sin pipeline ni licencia declarados) contiene dos implementaciones interoperables que comparten el mismo formato JSON de árbol (`resonance_tree.json`): `resonance.sh`, un script Bash 4+ para Linux, macOS y WSL2, y `resonance.py`, una versión para Python 3.8+ que solo usa la librería estándar (`urllib`, `json`, `uuid`), sin dependencias de pip.

Funcionalmente actúa como capa de orquestación y almacenamiento sobre proveedores externos: OpenAI, Anthropic, DeepSeek, Groq, Together, Ollama, xAI, Mistral y cualquier endpoint compatible (LM Studio, vLLM, OpenRouter). El modelo que responde lo elige el usuario mediante `setprovider` y `setmodel`, de modo que las capacidades de generación, la ventana de contexto efectiva y los requisitos de cómputo dependen íntegramente del backend configurado y no de esta herramienta.

Su interés es metodológico: frente al hilo único de las interfaces de chat, permite ramificar desde cualquier mensaje, reparentar nodos, etiquetar y buscar en todo el historial y exportar el resultado a Markdown. Se declara inspirada en la extensión de navegador Megi, reimplementada aquí como herramienta portable de CLI con persistencia local y sin telemetría propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplica: herramienta CLI en Bash y Python; no es una red neuronal |
| Parámetros totales | No aplica (no distribuye pesos) |
| Longitud de contexto | No disponible; la herramienta no impone ventana propia, la fija el proveedor configurado |
| Tipos de cuantización | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | Interfaz, comandos y documentación en inglés; el idioma de las respuestas lo determina el proveedor |
| Licencia | No disponible (no declarada en HuggingFace ni en la model card) |
| Formato de pesos | No aplica; los datos se persisten en JSON (`resonance_tree.json`) |
| Formato de datos | JSON: nodos con `id`, `role`, `text`, `starred`, `tags`, `children` |
| Dependencias (Bash) | bash 4+, curl, jq |
| Dependencias (Python) | Python 3.8+, solo biblioteca estándar |
| Proveedores soportados | OpenAI, Anthropic, DeepSeek, Groq, Together, Ollama, xAI, Mistral y endpoint personalizado |
| Configuración | `~/.resonance_config` con `chmod 600`; claves de API en texto plano local |
| Plataformas | Linux, macOS, WSL2; Windows nativo solo con la versión Python (o Git Bash/MSYS2) |
| Modos de ejecución | REPL interactivo y modo no interactivo (`ask`, `pipe`, `export`, `stats`) |
| Descargas / likes | 0 / 0 |
| Creación / actualización | 2026-10-17 / 2026-03-14 |

## Arquitectura y entrenamiento

No hay arquitectura de modelo ni entrenamiento: el repositorio no contiene pesos, dataset, proceso de preentrenamiento, ajuste supervisado ni RLHF/DPO, y no se referencia ningún paper. La "arquitectura" del proyecto es la de un cliente de API con estado: un REPL que parsea comandos (`ask`, `reply`, `move`, `collapse`, `star`, `tag`, `search`, `export`, `save`, `load`), un modelo de datos en árbol con un nodo raíz y relaciones padre-hijo, una capa de transporte HTTP implementada con `curl` en la versión Bash y con `urllib` en la versión Python, y un fichero de configuración local para proveedor, clave, modelo y URL base.

La única decisión de diseño destacable es la interoperabilidad del formato: ambas implementaciones leen y escriben el mismo JSON, de manera que un árbol creado con el script Bash se puede abrir con la versión Python. La estructura es inspeccionable y procesable con herramientas estándar; la propia model card documenta consultas con `jq`, por ejemplo para contar nodos de rol `ai` o listar los nodos marcados con estrella. No se documentan tests, versionado semántico ni pipeline de integración continua.

## Capacidades

- Ramificación de conversaciones: `reply <id> <text>` crea una nueva rama desde cualquier nodo, lo que permite explorar respuestas alternativas sin perder el hilo original.
- Reparentado de nodos: `move <id> <parent-id>` reorganiza el árbol a posteriori, sin reescribir el contenido.
- Anotación y curación: `note`, `star` y `tag` permiten marcar insights y clasificarlos con etiquetas consultables.
- Búsqueda de texto completo sobre todo el historial (`search <query>`) y listado de favoritos (`stars`).
- Plegado de ramas (`collapse`) para mantener legible el árbol sin eliminar contenido.
- Exportación a Markdown limpio (`export [file.md]`) y estadísticas del árbol (`stats`).
- Persistencia multifichero: `save` / `load [file.json]` y `new [name]` para proyectos separados.
- Abstracción multiproveedor: cambio de backend en caliente con `setprovider`, `setkey`, `setmodel` y `seturl`.
- Entrada por tubería (`cat paper.txt | ./resonance.sh pipe`) para inyectar documentos largos.
- Modo local sin red mediante Ollama, sin clave de API.
- No incluye capacidades propias de visión, audio, tool calling ni agentes: cualquier función de ese tipo depende del modelo subyacente elegido.

## Casos de uso

- Investigación documental con ramas: se ingiere un paper con `pipe`, se hacen preguntas sucesivas con `ask` y se abre una rama distinta por cada hipótesis; al final `export research_notes.md` genera un documento lineal legible para compartir.
- Comparación de proveedores sobre la misma pregunta: se formula la misma consulta contra OpenAI, Anthropic y un modelo local en Ollama usando `setprovider` y `reply` desde el mismo nodo padre, y se contrastan las respuestas lado a lado en el árbol.
- Diseño de prompts: cada variante de un prompt se registra como nodo hijo del mismo mensaje raíz, con `tag prompt-v2` para localizar después las iteraciones y `stars` para quedarse con la mejor.
- Estudio de un tema técnico con estructura de árbol: en lugar de un hilo largo, se crea una rama por subtema (p. ej. atención, positional encoding, KV cache) y se pliega las completadas con `collapse` para mantener la vista manejable.
- Documentación de decisiones de arquitectura: se anota la pregunta original, se ramifica por alternativas evaluadas y se usa `note` para la decisión final, exportando el árbol como registro de diseño versionable en Git junto al código.
- Trabajo con datos sensibles en local: configuración con Ollama y árbol en `resonance_tree.json` en disco, sin llamadas a terceros, adecuado para notas que no deben salir del portátil.
- Automatización en scripts: el modo no interactivo (`ask "..." --save`, `--parent <id>`) permite encadenar consultas desde un shell o un Makefile y acumular el resultado en el mismo árbol.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La herramienta no es evaluable con MMLU, HumanEval o GSM8K, ya que no genera texto por sí misma: cualquier métrica de calidad correspondería al modelo configurado. Tampoco se documentan cifras de latencia ni de throughput propias; el tiempo de respuesta depende del proveedor y del modelo seleccionado, y la sobrecarga añadida por la herramienta es la de una llamada HTTP más el parseo del JSON del árbol.

## Requisitos de hardware

- La herramienta en sí no requiere GPU ni VRAM: es un proceso de CLI que consume CPU y memoria de forma despreciable (órdenes de magnitud por debajo de 1 GB de RAM).
- Almacenamiento: el tamaño lo determina el árbol JSON; crece de forma lineal con el número de nodos y el texto acumulado.
- Con proveedores en la nube (OpenAI, Anthropic, DeepSeek, Groq, Together, xAI, Mistral) no se necesita hardware de inferencia local, solo conectividad de red.
- Con Ollama como backend, los requisitos son los del modelo local elegido (VRAM según tamaño y cuantización de ese modelo); la model card no aporta cifras concretas.
- Dependencias de sistema: `bash` 4+, `curl` y `jq` en la versión shell; únicamente Python 3.8+ en la versión Python.
- Despliegue: no aplica servidor de inferencia (vLLM, TGI, llama.cpp) para esta herramienta; vLLM o LM Studio solo entran como endpoint personalizado mediante `seturl`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Herramienta | Tipo | Ventaja diferencial | Licencia | Disponibilidad |
|---|---|---|---|---|
| Resonance | CLI (Bash y Python) con árbol JSON | Ramificación, reparentado, etiquetas, búsqueda y exportación a Markdown; multiproveedor | No disponible | Repositorio HuggingFace, 0 descargas |
| Megi | Extensión de navegador | Interfaz gráfica; citada como inspiración de Resonance | No disponible | No disponible en la información proporcionada |
| Interfaces web nativas de los proveedores (OpenAI, Anthropic, etc.) | Aplicación web | Integración directa con su propio modelo | No disponible | Comercial, acceso vía suscripción/API |
| Ollama | Runtime de inferencia local | Ejecución 100 % local sin clave de API; actúa como backend de Resonance | No disponible | No disponible en la información proporcionada |

No se dispone de datos de rendimiento, parámetros ni contexto de estas alternativas en la información proporcionada; la comparación es, por tanto, cualitativa y centrada en el modelo de interacción (árbol frente a hilo lineal) y en el modo de despliegue (CLI frente a extensión o web).

## Limitaciones y advertencias

- No es un modelo: no dispone de parámetros, contexto propio ni benchmarks; publicarlo en HuggingFace bajo un repositorio sin pipeline declarado puede inducir a confusión.
- Licencia no declarada: sin términos explícitos no hay autorización clara para uso comercial ni para redistribución; conviene contactar con el autor antes de integrarlo en producción.
- Validación nula: 0 descargas y 0 likes, sin tests documentados ni historial de versiones; la madurez del código no es verificable.
- Metadatos incoherentes: la fecha de actualización (2026-03-14) es anterior a la de creación (2026-10-17), lo que sugiere un error de registro o una migración del repositorio.
- Claves de API en texto plano en `~/.resonance_config`; el `chmod 600` protege frente a otros usuarios del sistema, pero no frente a root, malware o copias de seguridad no cifradas.
- Superficie de privacidad: cada `ask` envía el texto al endpoint configurado; el modo local exige Ollama y un modelo descargado aparte.
- Concurrencia: el árbol vive en un único fichero JSON sin bloqueo ni fusión de cambios; dos procesos simultáneos pueden sobrescribirse.
- Windows: la versión Bash requiere WSL2, Git Bash o MSYS2; solo la versión Python funciona de forma nativa.
- Interfaz y mensajes de error en inglés; no hay localización al castellano.
- Riesgo de alucinación y sesgos: heredados íntegramente del modelo subyacente, sin filtros ni validación por parte de la herramienta.
- Sin control de costes: no se documentan límites de tokens, contadores de gasto ni reintentos ante errores de cuota.
- La búsqueda web realizada no devolvió resultados relevantes sobre el proyecto (los enlaces obtenidos remiten a códigos musicales de Roblox), por lo que no hay fuentes externas que corroboren la model card.

## Enlaces

- HuggingFace: https://huggingface.co/swordenamine/resonance
- Megi (inspiración declarada): https://megi.dev
- Paper, blog o demo del proyecto: no disponibles en la información proporcionada.
- Repositorio de código independiente, releases o documentación adicional: no disponibles en la información proporcionada.
