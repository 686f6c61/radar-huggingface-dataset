# zivirez/borderlands-4-save-editor

## Resumen

`zivirez/borderlands-4-save-editor` es un repositorio alojado en Hugging Face que, a pesar de su identificador y de las etiquetas propias de la plataforma, no contiene un modelo de inteligencia artificial. Se trata de una herramienta de escritorio para Windows 10 y Windows 11 de 64 bits, distribuida como aplicación portable, cuyo propósito declarado es la edición de partidas guardadas, el descifrado de perfiles y la gestión de golden keys del videojuego Borderlands 4. El autor identificado es zivirez y la licencia declarada es MIT.

La publicación no incluye pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia; el campo pipeline figura como no disponible y las categorías de tarea se limitan a "other". El contenido de la model card describe una aplicación nativa con soporte para DirectX 12 y Vulkan, alineación de registros vectoriales AVX2 y configuración JSON recargable en caliente, además de una matriz de pruebas de rendimiento sobre distintos perfiles de hardware.

Por tanto, esta ficha no puede evaluar el artefacto como modelo lingüístico: no hay parámetros, contexto, cuantizaciones ni capacidades de generación que describir. La información disponible permite documentar únicamente el empaquetado, los requisitos de plataforma y las advertencias de seguridad asociadas a la distribución, que incluyen un archivo comprimido protegido con contraseña alojado en un repositorio de GitHub de terceros y no en el propio espacio de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; aplicación nativa x64 para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, es, pt, de, fr, tr, pl, ja, ko, id, vi, zh (12 idiomas) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribución en archivo `.zip` para Windows x64) |

## Arquitectura y entrenamiento

No se ha publicado información sobre arquitectura de red neuronal ni sobre proceso de entrenamiento, porque el artefacto no es un modelo entrenado. La documentación del autor describe una aplicación de escritorio compilada para Windows 10 (22H2 o superior) y Windows 11 (23H2/24H2), con ejecución portable, uso de instrucciones AVX2, integración con DirectX 12 y Vulkan 1.3, y un archivo `config/settings.json` que puede recargarse en caliente. El tamaño del repositorio se declara en la categoría 1K–10K, coherente con un binario pequeño y no con pesos de modelo.

La cadena de distribución descrita en la model card presenta inconsistencias notables: el archivo comprimido enlazado se denomina `elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.zip`, un nombre ajeno al proyecto, se aloja en un repositorio de GitHub de un tercero (`claudio00344`) y requiere una contraseña de extracción (`2026`). Este patrón es habitual en campañas de distribución de software no verificado. No se dispone de información sobre datasets, RLHF, DPO ni ninguna innovación técnica de inferencia.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- La funcionalidad declarada es la edición de partidas guardadas de Borderlands 4, el descifrado de perfiles de usuario y la gestión de golden keys.
- La interfaz y la documentación se ofrecen en 12 idiomas: inglés, español, portugués, alemán, francés, turco, polaco, japonés, coreano, indonesio, vietnamita y chino.
- No se documentan capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- Edición de partidas guardadas de Borderlands 4 en Windows: la herramienta permitiría modificar valores del archivo de guardado, como nivel, dinero o inventario, sobre una instalación local del juego.
- Descifrado de perfiles de usuario: según la documentación, permitiría acceder al perfil cifrado del juego para inspeccionar o modificar sus campos.
- Gestión de golden keys: la aplicación declararía utilidades para administrar estas claves del juego sin necesidad de introducirlas manualmente.
- Uso en entornos de prueba aislados: al ser portable y no requerir instalación, podría ejecutarse en una máquina virtual Windows para experimentar con copias de seguridad de partidas.
- Documentación multilingüe: los 12 idiomas declarados facilitan el acceso a usuarios no angloparlantes a las instrucciones de uso.
- No se identifican casos de uso legítimos relacionados con IA, generación de contenido, automatización de procesos o análisis de datos, porque el artefacto no ofrece esas funciones.

## Benchmarks y rendimiento

La model card incluye una matriz de telemetría de la aplicación, no de un modelo. Se reproduce a continuación tal como se publicó, sin verificación independiente:

| Perfil de hardware | API / runtime | Latencia p99 | Memoria | Integridad |
|---|---|---|---|---|
| RTX 4070 / Ryzen 7 7800X3D (Win 11 24H2) | DX12 / Vulkan 1.3 | 1,42 ms (+48 % en 1 % low FPS) | 44,8 MB RAM | PASS (SHA-256) |
| RTX 3060 / Core i5-13600K (Win 11 23H2) | DX12 / AVX2 | 1,89 ms (+41 % en 1 % low FPS) | 42,4 MB RAM | PASS (SHA-256) |
| RX 7800 XT / Ryzen 5 7600X (Win 10 22H2) | Vulkan / Async Compute | 1,65 ms (+44 % en 1 % low FPS) | 43,1 MB RAM | PASS (SHA-256) |
| Arc A770 / Core i7-12700K (Win 11 24H2) | XeSS / DX12 SwapChain | 2,15 ms (+37 % en 1 % low FPS) | 45,2 MB RAM | PASS (SHA-256) |

No se han publicado resultados de benchmarks de modelos de IA (MMLU, HumanEval, GSM8K u otros) porque el artefacto no es un modelo.

## Requisitos de hardware

- Sistema operativo: Windows 10 22H2 o superior, o Windows 11 23H2/24H2, en arquitectura x64.
- CPU: se declara uso de AVX2, por lo que se requiere un procesador relativamente moderno (Intel Haswell o posterior, AMD Excavator o posterior).
- GPU: DirectX 12 o Vulkan 1.3; los perfiles probados incluyen RTX 4070, RTX 3060, RX 7800 XT y Arc A770, pero no se especifica un mínimo.
- Memoria: entre 42,4 y 45,2 MB de RAM según la matriz publicada, un consumo propio de una utilidad de escritorio.
- Almacenamiento: no disponible; el repositorio se clasifica en el rango 1K–10K.
- Opciones de despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI); la distribución es un `.zip` portable.
- Latencia y throughput: la documentación reporta latencias p99 de 1,42 a 2,15 ms, sin metodología reproducible publicada.

## Comparativa con modelos similares

No procede una comparativa con modelos de IA. Como referencia de categoría, se compara con otras herramientas de edición de partidas guardadas, sin datos verificables disponibles:

| Herramienta | Plataforma | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|
| `zivirez/borderlands-4-save-editor` | Windows x64 | Edición de guardados, descifrado de perfil, golden keys | MIT (declarada) | Hugging Face, con binario en GitHub de terceros |
| Editores de guardado de la comunidad para Borderlands | Windows | Edición de guardados | Variable | Foros y repositorios comunitarios |
| Herramientas genéricas de edición hexadecimal | Multiplataforma | Edición manual de archivos | Variable | Ampliamente disponible |
| Modelos de lenguaje comparables | — | no disponible | — | — |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal; las etiquetas de Hugging Face (`en`, `es`, etc.) reflejan los idiomas de la documentación, no capacidades lingüísticas.
- El binario se distribuye mediante un archivo `.zip` protegido con contraseña alojado en un repositorio de GitHub de un tercero, con un nombre de archivo que no corresponde al proyecto (`elden-ring-nightreign-trainer-coop-2026`). Este patrón es característico de campañas de distribución de software no verificado y debe tratarse con máxima cautela.
- No se ofrece suma de comprobación publicada de forma independiente ni firma de código; la verificación SHA-256 que menciona la model card no es comprobable por terceros.
- Riesgo de malware: ejecutar binarios de procedencia no verificada en un equipo con datos personales o cuentas de juego puede comprometer credenciales y ficheros.
- La edición de partidas guardadas puede infringir los términos de servicio del videojuego y provocar sanciones o bloqueos de cuenta.
- La licencia MIT se declara en los metadatos, pero al no haber código fuente auditable en el espacio de Hugging Face no puede confirmarse su aplicación al binario distribuido.
- No hay información sobre sesgos, alucinación, límites de contexto ni restricciones de uso comercial en el sentido de un modelo generativo, porque esas categorías no aplican.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zivirez/borderlands-4-save-editor
- Repositorio GitHub citado como principal: https://github.com/baonq0507/borderlands-4-save-editor
- Repositorio GitHub alternativo citado: https://github.com/susantayl-notes74/borderlands-4-save-editor
- Portal de documentación citado: https://baonq0507.github.io/borderlands-4-save-editor/
- Portal espejo citado: https://susantayl-notes74.github.io/borderlands-4-save-editor/
- Archivo de distribución citado (no verificado): https://github.com/claudio00344/elden-ring-nightreign-trainer-coop-2026/releases/download/v1.2.0/elden-ring-nightreign-trainer-coop-2026-v1.2.2-win64.zip
- Documentación de paquete Go citada: https://pkg.go.dev/github.com/baonq0507/borderlands-4-save-editor
- Cuaderno de verificación citado: https://nbviewer.org/github/baonq0507/borderlands-4-save-editor/blob/main/notebooks/quickstart.ipynb
