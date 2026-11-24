# zaper4life/deadlock-cheat-aimbot-esp

## Resumen

El artefacto publicado bajo el identificador `zaper4life/deadlock-cheat-aimbot-esp` en Hugging Face no es un modelo de inteligencia artificial, sino un supuesto ejecutable de trampas (aimbot y ESP) para el videojuego *Deadlock*. La model card describe un binario portable para Windows 10/11 de 64 bits, empaquetado en un ZIP de 8,9 MB protegido con contraseña, con módulos de superposición externa, escáner de offsets, capa de renderizado "stream-proof" y suavizado de entrada Bézier. No existe ningún peso neuronal, tokenizador, configuración de arquitectura ni pipeline de inferencia asociado.

Por tanto, esta ficha no puede documentar arquitectura, parámetros, contexto, cuantizaciones ni capacidades cognitivas: esos campos no están disponibles porque el objeto publicado no es un modelo. Lo relevante aquí, desde el punto de vista de un desarrollador o investigador, es la evaluación de riesgo: el repositorio presenta todos los patrones habituales de una distribución de *malware* disfrazada de *cheat* (binario ejecutable como administrador, contraseña fija en el archivo comprimido para evadir análisis automáticos, enlaces a un repositorio de GitHub de terceros ajeno al autor declarado, y una discrepancia entre el ID de Hugging Face y el repositorio de descargas).

La ficha se redacta igualmente de forma completa, indicando de manera explícita "no disponible" en cada especificación técnica que no exista, y se documentan los riesgos y las advertencias de seguridad pertinentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (metadatos de la model card, no capacidades lingüísticas reales) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento que documentar. La model card describe, en su lugar, un conjunto de módulos de software nativo para Windows x64: una superposición externa a 144 Hz o más con cajas delimitadoras 2D/3D y esqueletos de huesos, un escáner asíncrono de offsets con resolución automática de firmas de punteros tras parches del juego, una capa de renderizado "stream-proof" que afirma excluir la captura de OBS, ShadowPlay y Discord, una tecla de pánico (`END`) para descarga instantánea, perfiles JSON intercambiables en caliente y suavizado de entrada Bézier con radio de FOV y comprobación de visibilidad configurables.

El texto menciona métricas como "11 hilos de trabajo", "menos de 45 MB de RAM", "99,1 % de consistencia" y el *build* `v2.6.5 (2BFA9D)`, pero no aporta ninguna evidencia verificable (código fuente, hashes, firmas, análisis independiente). No se indica ningún conjunto de datos, tokenizador, técnica de alineación (RLHF/DPO) ni innovación en el sentido de la IA. La única "innovación" declarada es de ingeniería de *cheats*, no de aprendizaje automático.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión: no es un modelo lingüístico ni multimodal.
- No soporta *tool calling* ni *function calling* en el sentido de los modelos de IA.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- Las capacidades multilingües son ficticias: los 14 códigos de idioma son etiquetas de metadatos sin respaldo funcional.
- Las únicas "capacidades" descritas son funciones de trampa para un videojuego: aimbot con suavizado Bézier, ESP de cajas y esqueletos, escáner de offsets y ocultación ante capturadores de pantalla.
- No hay *thinking mode*, ni visión, ni audio, ni ninguna capacidad de modelo fundacional.

## Casos de uso

No existen casos de uso legítimos para un modelo de IA, porque el artefacto no lo es. Los escenarios que se enumeran a continuación describen únicamente lo que la model card afirma que hace el binario, junto con la valoración de riesgo correspondiente:

- Uso como *cheat* en *Deadlock*: la model card promete aimbot y ESP; su uso conlleva la expulsión de la cuenta y posibles acciones legales según los términos de servicio del juego.
- Automatización de trampas en partidas multijugador: el suavizado Bézier y la comprobación de visibilidad buscan evadir la detección; es una violación directa de las normas de la plataforma.
- Ocultación ante capturadores: la capa "stream-proof" está diseñada para que las transmisiones no revelen las trampas, lo que facilita el engaño a la audiencia.
- Distribución de software a terceros: el ZIP con contraseña fija y la ejecución como administrador son vectores clásicos de *malware*; no debe desplegarse en ningún entorno.
- Investigación de seguridad: únicamente como muestra a analizar en un entorno aislado y sin ejecución, para estudiar técnicas de empaquetado y evasión.
- Formación en concienciación: sirve como ejemplo didáctico de ingeniería social (insignias de "99 % verificado", "236 K descargas", contraseña compartida) para enseñar a identificar repositorios fraudulentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras de marketing ("99 % de valoración", "236 K descargas", "99,1 % de consistencia") sin metodología, sin fuente y sin posibilidad de verificación; no constituyen benchmarks y no deben citarse como tales.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos que cargar en GPU.
- GPU recomendadas: no disponible; el artefacto es un ejecutable de CPU para Windows x64.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados por el autor: Windows 10 u 11 de 64 bits, ejecución como administrador, menos de 45 MB de RAM según la model card.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; no existe artefacto de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No procede una comparativa con modelos de IA, ya que el artefacto no pertenece a esa categoría. A modo de contraste, se incluye una tabla con la naturaleza del objeto publicado frente a un modelo de lenguaje real de referencia:

| Criterio | `zaper4life/deadlock-cheat-aimbot-esp` | Modelo de lenguaje típico (referencia genérica) |
|---|---|---|
| Naturaleza | Ejecutable Win64 empaquetado en ZIP | Pesos neuronales en safetensors/GGUF |
| Parámetros | no disponible (ninguno) | millones a cientos de miles de millones |
| Contexto | no disponible | miles a millones de tokens |
| Licencia | MIT declarada | variable (Apache-2.0, MIT, comunitaria) |
| Verificabilidad | nula (sin hashes ni fuente) | model card, paper y evaluaciones públicas |
| Riesgo de seguridad | alto (binario con contraseña, ejecución como admin) | bajo si procede de un repositorio auditado |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no puede evaluarse con benchmarks de modelos.
- Riesgo elevado de *malware*: un ejecutable que se pide ejecutar como administrador, dentro de un ZIP con contraseña fija (`2026`) para dificultar el análisis antivirus, es un patrón clásico de distribución de *trojans* y *stealers*.
- Suplantación de identidad: el ID de Hugging Face (`zaper4life`) no coincide con el repositorio de GitHub enlazado (`gilles038`), lo que sugiere una cadena de distribución ajena al autor declarado.
- Alucinación de credenciales: las insignias de "99 % verificado" y "236 K descargas" son imágenes estáticas sin respaldo; no deben tomarse como señal de confianza.
- Restricciones de uso: aunque la licencia declarada es MIT, el uso del binario como *cheat* incumple los términos de servicio de *Deadlock* y puede acarrear sanciones legales y de cuenta.
- Sin soporte ni mantenimiento: cero descargas y cero *likes* en el momento de la consulta; no hay comunidad, issues ni actualizaciones verificables.
- Recomendación: no descargar, no extraer y no ejecutar el archivo; si se analiza, hacerlo en una máquina virtual aislada y sin red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zaper4life/deadlock-cheat-aimbot-esp
- Repositorio de GitHub enlazado en la model card (no verificado): https://github.com/gilles038/deadlock-cheat-aimbot-esp
- Descarga directa citada por el autor (no recomendada): https://github.com/gilles038/deadlock-cheat-aimbot-esp/releases/latest/download/deadlock-cheat-aimbot-esp-v1.2.0-win64.zip
- Paper, blog o demo: no disponible
