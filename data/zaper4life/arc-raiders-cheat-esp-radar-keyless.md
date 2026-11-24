# zaper4life/arc-raiders-cheat-esp-radar-keyless

## Resumen

El repositorio `zaper4life/arc-raiders-cheat-esp-radar-keyless` no contiene un modelo de inteligencia artificial. Se trata de un paquete alojado en Hugging Face que se presenta como una herramienta de trucos (cheat) para el videojuego Arc Raiders, con funcionalidades de ESP (visualización de enemigos a través de paredes) y radar, distribuidas como ejecutable portable para Windows x64. La model card describe una utilidad de superposición externa con detección de cajas delimitadoras, esqueletos de huesos y suavizado de entrada, no una red neuronal con pesos entrenados.

No se dispone de arquitectura, parámetros, contexto ni datos de entrenamiento, porque el artefacto no es un modelo de lenguaje ni de visión. El repositorio incluye etiquetas de idioma (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) que probablemente corresponden a los idiomas de la interfaz de la herramienta, no a capacidades lingüísticas de un modelo. La licencia declarada es MIT, aunque su aplicación a software de trampas para videojuegos plantea dudas legales y de términos de servicio.

La relevancia de esta ficha es, por tanto, descriptiva y de advertencia: documenta un artefacto que no cumple los criterios de un modelo open source evaluable, y señala los riesgos de seguridad asociados a la descarga de ejecutables de procedencia desconocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una utilidad ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio; presumiblemente idiomas de interfaz) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye como archivo ZIP con un ejecutable `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No hay información sobre arquitectura de red neuronal ni sobre un proceso de entrenamiento. La model card describe una herramienta de superposición externa que, según el autor, emplea un núcleo en modo usuario con cinco hilos de trabajo, renderizado mediante Desktop Duplication y sin hooks DLL internos. Menciona también un escáner dinámico de offsets con resolución automática de firmas de punteros tras parches del juego y un tiempo de respuesta declarado inferior a 22 ms.

Estas afirmaciones provienen exclusivamente del texto promocional del autor y no están verificadas ni acompañadas de documentación técnica, código fuente o artefactos reproducibles. No se especifican conjuntos de datos, tokens de entrenamiento, técnicas de alineación (RLHF, DPO) ni innovaciones de inferencia, porque no aplican a este tipo de artefacto.

## Capacidades

- Superposición externa a 144 Hz o más, según el autor, con cajas delimitadoras 2D y 3D, esqueletos de huesos y ESP de distancia.
- Suavizado de entrada tipo bézier con radio de FOV configurable, comprobación de visibilidad y curvas de objetivo "humanizadas".
- Perfiles JSON intercambiables en caliente con presets Legit, Visual y Custom.
- Escáner dinámico de offsets para resolver firmas de punteros tras actualizaciones del juego.
- Capa de renderizado que, según el autor, evita la captura por OBS, ShadowPlay y Discord.
- Núcleo externo en modo usuario con renderizado por Desktop Duplication.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión artificial, tool calling, capacidades de agente ni modo de pensamiento.

## Casos de uso

- No se identifican casos de uso legítimos para un modelo de IA, ya que el artefacto no es un modelo.
- Uso declarado por el autor: asistencia visual en partidas de Arc Raiders mediante ESP y radar, lo que constituye una ventaja injusta y probablemente infringe los términos de servicio del juego.
- Análisis de seguridad: el artefacto puede estudiarse en un entorno aislado para entender técnicas de superposición externa y evasión de captura, con fines defensivos o de investigación de trampas.
- Docencia sobre riesgos de cadena de suministro: sirve como ejemplo de repositorio en Hugging Face que no contiene un modelo y que distribuye un ejecutable con contraseña de descompresión.
- Auditoría de plataformas: caso de estudio para revisar las políticas de moderación de contenido en plataformas de modelos.
- No se recomienda su uso en producción, atención al cliente, generación de código ni ningún escenario de despliegue de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Sistema operativo: Windows 10 o Windows 11 de 64 bits, según la model card.
- VRAM estimada para inferencia: no aplica, al no ser un modelo de IA.
- GPU recomendadas: no aplica; el autor no especifica requisitos de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ejecutable portable `arc-raiders-cheat-esp-radar-keyless-v1.2.0-win64.exe`; no se contemplan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor declara un tiempo de respuesta inferior a 22 ms para el escáner de offsets y una superposición de 144 Hz o más, sin datos verificables.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zaper4life/arc-raiders-cheat-esp-radar-keyless` | Utilidad de trampas para Windows | no disponible | no disponible | MIT | Hugging Face y GitHub |
| Modelos de lenguaje open source (p. ej., familias Llama, Mistral, Qwen) | Modelos de IA | variable | variable | variable | Hugging Face |
| Herramientas de superposición externa para juegos | Software de trampas | no aplica | no aplica | variable | Foros y repositorios no oficiales |

No disponible una comparativa técnica significativa, porque el artefacto no pertenece a la misma categoría que un modelo de IA.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; las etiquetas y la model card describen una herramienta de trampas para videojuegos.
- Riesgo de seguridad elevado: se distribuye un ejecutable `.exe` dentro de un ZIP protegido con contraseña, alojado en un repositorio de GitHub de terceros, sin firma de código ni verificación de integridad.
- Posible infracción de los términos de servicio de Arc Raiders y de la legislación sobre trampas en videojuegos en algunas jurisdicciones.
- La licencia MIT declarada no garantiza la legalidad del uso del software ni la ausencia de código malicioso.
- No hay evidencia de auditoría, código fuente reproducible ni resultados de benchmarks.
- Las afirmaciones de rendimiento (144 Hz, 98,4 % de consistencia, 22 ms) proceden únicamente del autor y no son verificables.
- Uso comercial desaconsejado y, en muchos contextos, ilícito.
- No debe ejecutarse en máquinas con datos sensibles; si se analiza, hacerlo en una máquina virtual aislada y sin red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zaper4life/arc-raiders-cheat-esp-radar-keyless
- Repositorio en GitHub citado en la model card: https://github.com/vkuznetsov5922/arc-raiders-cheat-esp-radar-keyless
- Descarga directa citada en la model card: https://github.com/vkuznetsov5922/arc-raiders-cheat-esp-radar-keyless/releases/latest/download/arc-raiders-cheat-esp-radar-keyless-v1.2.0-win64.zip
- Página de releases citada en la model card: https://github.com/vkuznetsov5922/arc-raiders-cheat-esp-radar-keyless/releases/latest
