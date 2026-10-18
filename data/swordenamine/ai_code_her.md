# swordenamine/ai_code_her

## Resumen

`swordenamine/ai_code_her` no es un modelo de lenguaje: es un repositorio de scripts de instalación y orquestación para ejecutar asistentes de programación basados en API (Claude Code, ChatGPT, Gemini, DeepSeek y Mistral) dentro de Termux en Android. La model card lo describe explícitamente como "un entorno Android ligero... sin modelos locales, solo potencia de API", con un peso aproximado de 300 MB, de los cuales la mayor parte corresponde a Termux, Node.js, Python, Git y los distintos CLI. No se distribuyen pesos, no hay ficheros safetensors ni GGUF y no existe un proceso de entrenamiento asociado.

El problema que aborda es la fragmentación de clientes: en lugar de instalar una aplicación por proveedor, el repositorio ofrece un bootstrap común, un gestor de claves de API, un conmutador (`ai claude`, `ai gemini`, etc.) y un servidor HTTP local en el puerto 8765 que expone el proveedor activo al resto de dispositivos de la red. Todo el cómputo del modelo ocurre en los servidores del proveedor correspondiente; el dispositivo Android solo actúa como cliente.

Su relevancia es, por tanto, la de una herramienta de desarrollo, no la de un modelo evaluable. La ficha se ha redactado igualmente con la estructura solicitada, marcando como "no disponible" todos los parámetros que no existen o no se han publicado. Conviene señalar que los metadatos de HuggingFace no declaran licencia ni idiomas, que la model card atribuye el proyecto a "swordenkisk" mientras que el autor del repo es "swordenamine", y que las fechas de creación (2026-10-17) y actualización (2026-03-05) son incoherentes entre sí.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. No es un modelo neuronal: es un conjunto de scripts Bash/Python de instalación y enrutado hacia APIs externas |
| Parámetros totales | No disponible (no aplica: no contiene pesos) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible. Depende del proveedor externo invocado (Claude, OpenAI, Gemini, DeepSeek, Mistral) |
| Tipos de cuantización | No disponible (no hay pesos que cuantizar) |
| Idiomas soportados | No disponibles en los metadatos. El idioma efectivo lo determina la API del proveedor elegido |
| Licencia | MIT según la model card (Copyright 2026 swordenkisk). El metadato de licencia de HuggingFace no está declarado |
| Formato de pesos | No disponible (no se distribuyen pesos; solo código y scripts) |
| Plataforma | Android 5.0 o superior con Termux instalado desde F-Droid |
| Tamaño en disco | Aproximadamente 300 MB en total (Termux ~80 MB, Node.js ~55 MB, Python ~15 MB, Git y herramientas ~45 MB, CLI de IA ~105 MB) |
| Dependencias | Internet (Wi-Fi o datos móviles) y una o más claves de API de los proveedores |
| Proveedores integrados | Claude (~35 MB), ChatGPT (~20 MB), Gemini (~20 MB), DeepSeek (~15 MB), Mistral (~15 MB) |
| Servidor local | HTTP en el puerto 8765, endpoint `POST /ask` con campos `prompt` y `ai` |
| Versión declarada | 1.0.0 |
| Fecha de creación en HuggingFace | 2026-10-17 |
| Fecha de actualización en HuggingFace | 2026-03-05 (anterior a la de creación; dato incoherente) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni entrenamiento. La "arquitectura" del proyecto es una estructura de directorios con un subdirectorio por proveedor (`claude/`, `chatgpt/`, `gemini/`, `deepseek/`, `mistral/`), cada uno con su `bootstrap.sh` y su README, más un directorio `scripts/` con cinco utilidades: `bootstrap_all.sh` (instalación conjunta), `set_keys.sh` (gestión de claves), `switcher.sh` (comando `ai` para cambiar de proveedor), `server.sh` (servidor HTTP unificado) y `new_project.sh` (andamiaje de proyectos). La configuración global reside en `config/.ai_code_her.yml` y la documentación en `docs/` (SETUP, KEYS, TROUBLESHOOT).

El flujo de instalación es: instalar Termux desde F-Droid, ejecutar el bootstrap maestro mediante `curl` sobre un script alojado en GitHub, introducir las claves con `set_keys.sh` y seleccionar proveedor con `ai <nombre>`. El repositorio mezcla Node.js y Python como runtimes de los distintos CLI. No se documentan mecanismos de caché, reintentos, control de cuotas, telemetría ni gestión de errores más allá de un fichero de troubleshooting. Tampoco se detalla el contenido exacto de `bootstrap_all.sh`, por lo que el comportamiento real de la instalación no es verificable a partir de la información disponible.

## Capacidades

- Conmutación entre cinco proveedores de asistentes de código mediante un único comando (`ai claude`, `ai chatgpt`, `ai gemini`, `ai deepseek`, `ai mistral`).
- Consulta directa sin cambiar el proveedor activo mediante `ai --use <proveedor> "consulta"` y consulta al activo con `ai ask "consulta"`.
- Consulta del estado del entorno con `ai status`.
- Instalación automatizada de todos los proveedores en una sola orden.
- Gestión centralizada de claves de API mediante `set_keys.sh`.
- Exposición del proveedor activo como endpoint HTTP local (`POST http://IP_DEL_TELEFONO:8765/ask`), consumible desde cualquier dispositivo de la misma red.
- Andamiaje de proyectos compartido entre proveedores mediante `new_project.sh` y un espacio de trabajo único.
- Aprovechamiento de las capacidades del modelo remoto subyacente (generación de código, razonamiento, tool calling, etc.), que no son propias de este repositorio y no se documentan en la model card.

## Casos de uso

- Programación desde el móvil sin equipo de sobremesa: un desarrollador puede lanzar Claude Code o ChatGPT CLI en Termux y trabajar sobre un repositorio clonado en el propio dispositivo, usando la ventana de contexto que ofrezca la API remota.
- Comparación rápida de respuestas entre proveedores: cambiar de proveedor con una sola orden permite enviar la misma consulta a Claude, Gemini y DeepSeek y contrastar resultados sin reinstalar clientes. La hoja de ruta incluye un modo de comparación automática en la versión 1.3.
- Pasarela doméstica de IA: el servidor en el puerto 8765 permite que un portátil, una tableta o un segundo móvil de la misma Wi-Fi consulten el proveedor activo mediante `curl`, útil para scripts ligeros o prototipos.
- Entornos con recursos muy limitados: al no ejecutar inferencia local, el consumo de CPU, RAM y batería se reduce al de un cliente HTTP, lo que encaja en dispositivos de gama baja o en situaciones de movilidad.
- Aprendizaje y experimentación con APIs: el repositorio sirve como plantilla para entender cómo se autentican y consumen distintas APIs de asistentes de código, con ficheros de bootstrap separados por proveedor.
- Uso en auditoría o formación: al centralizar las claves en un único gestor y permitir alternar proveedores, facilita demostraciones didácticas sobre diferencias de comportamiento entre asistentes, siempre que se respeten las condiciones de uso de cada API.
- Integración en flujos de trabajo personales: `new_project.sh` y el espacio de trabajo compartido permiten mantener un mismo directorio de proyecto mientras se alterna entre asistentes según la tarea (por ejemplo, depuración con uno y generación de tests con otro).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no evalúa ningún modelo propio: el rendimiento observable es el del proveedor de API seleccionado en cada momento, y la model card no incluye latencias, throughput ni métricas de calidad. Los únicos datos cuantitativos publicados son de tamaño en disco (unos 300 MB totales) y de tamaño de cada CLI (entre 15 MB y 35 MB).

## Requisitos de hardware

- VRAM: no aplica. No hay inferencia local ni pesos que cargar en GPU; el cómputo se realiza en los servidores del proveedor.
- GPU recomendadas: ninguna. El repositorio está pensado para ejecutarse en un dispositivo Android.
- Dispositivo: Android 5.0 o superior, con Termux instalado obligatoriamente desde F-Droid (la model card advierte explícitamente de no usar la versión de Play Store).
- Almacenamiento: aproximadamente 300 MB libres, desglosados en Termux (~80 MB), Node.js (~55 MB), Python (~15 MB), Git y herramientas (~45 MB) y CLI de IA (~105 MB).
- Memoria y CPU: no se especifican mínimos. Al ser un cliente HTTP, la carga es la de un proceso Node.js o Python más el propio Termux.
- Red: conexión Wi-Fi o de datos móviles estable; sin conexión el entorno no puede responder consultas.
- Despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI. El único servicio es el servidor HTTP propio (`scripts/server.sh`) en el puerto 8765. La hoja de ruta menciona un puente con Ollama para modelos locales en la versión 1.2, aún no implementado según la información disponible.
- Latencia y throughput: no disponibles. Dependen íntegramente de la API remota y de la calidad de la conexión; el repositorio no publica mediciones.

## Comparativa con modelos similares

No hay modelos comparables en sentido estricto, porque no es un modelo. Se compara con herramientas de propósito cercano, indicando únicamente lo que consta en la información disponible o es verificable de forma general.

| Herramienta | Naturaleza | Ejecución | Modelos | Licencia | Observaciones |
|---|---|---|---|---|---|
| ai_code_her | Scripts de instalación y enrutado a APIs | Cliente en Android/Termux; inferencia remota | Claude, ChatGPT, Gemini, DeepSeek, Mistral vía API | MIT según model card | ~300 MB, requiere claves propias; sin benchmarks publicados |
| Ollama | Runtime de inferencia local | Local (CPU/GPU) | Modelos abiertos en formato GGUF | MIT (dato general del proyecto) | Ejecuta pesos en el dispositivo; requiere hardware capaz de cargar el modelo |
| llama.cpp | Motor de inferencia local | Local | GGUF | MIT (dato general del proyecto) | Enfocado a eficiencia en CPU; no es un gestor multi-proveedor |
| Clientes oficiales de cada proveedor | CLI propietario | Local (cliente) | Un solo proveedor | Según el proveedor | Requieren instalación y configuración independientes por proveedor |

No se dispone de datos de rendimiento ni de parámetros que permitan una comparación cuantitativa entre estas herramientas dentro de la información proporcionada.

## Limitaciones y advertencias

- No es un modelo: no puede evaluarse con MMLU, HumanEval ni GSM8K, y no debe citarse como modelo de lenguaje en comparativas de modelos.
- Dependencia total de terceros: sin conexión y sin clave de API válida el entorno no produce ninguna respuesta. No hay modo offline; la hoja de ruta lo sitúa en la versión 2.0.
- Riesgo de ejecución de código remoto: la instalación recomendada consiste en canalizar por `curl` un script alojado en GitHub directamente a `bash`. Es una práctica que impide revisar el contenido antes de ejecutarlo y que conviene sustituir por descarga y lectura previa.
- Almacenamiento de credenciales: `set_keys.sh` gestiona las claves de API en el propio dispositivo. La model card no describe cifrado, permisos de fichero ni gestión de secretos, lo que es un riesgo en un terminal móvil potencialmente compartido o comprometido.
- Exposición en red: el servidor del puerto 8765 se anuncia como accesible desde cualquier dispositivo de la misma Wi-Fi. No se documenta autenticación, TLS ni control de acceso, por lo que no debería exponerse fuera de redes de confianza.
- Costes no acotados: el uso se factura según las tarifas de cada proveedor. El repositorio no incluye limitadores de gasto, cuotas ni registro de consumo.
- Licencia ambigua: la model card declara MIT, pero el metadato de HuggingFace no declara licencia, y las condiciones de uso de cada API (Anthropic, OpenAI, Google, DeepSeek, Mistral) se aplican de forma independiente y pueden restringir el uso comercial del contenido generado.
- Metadatos inconsistentes: autor del repo ("swordenamine") distinto del autor citado en la model card ("swordenkisk"); fecha de actualización anterior a la de creación; cero descargas y cero likes, sin señales de validación por parte de la comunidad.
- Sin hoja de ruta verificable: las versiones 1.1 a 2.0 (Grok, puente con Ollama, modo comparación, GUI nativa) figuran como casillas sin marcar; no hay evidencia de implementación.
- Idiomas: no se declaran. La calidad multilingüe depende exclusivamente del proveedor remoto y no del repositorio.
- Sesgos y alucinaciones: no son atribuibles a este proyecto, sino al modelo remoto invocado; el repositorio no añade ninguna capa de verificación ni de citación de fuentes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/swordenamine/ai_code_her
- Perfil del autor citado en la model card: https://github.com/swordenkisk
- Repositorio de GitHub referenciado en el bootstrap (según la model card): https://github.com/swordenkisk/ai_code_her
- Script de instalación maestra citado: https://raw.githubusercontent.com/swordenkisk/ai_code_her/main/scripts/bootstrap_all.sh
- Termux en F-Droid: https://f-droid.org/packages/com.termux/
- Claves de Anthropic: https://console.anthropic.com
- Claves de OpenAI: https://platform.openai.com
- Claves de Google AI Studio: https://aistudio.google.com
- Claves de DeepSeek: https://platform.deepseek.com
- Claves de Mistral: https://console.mistral.ai
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada.
