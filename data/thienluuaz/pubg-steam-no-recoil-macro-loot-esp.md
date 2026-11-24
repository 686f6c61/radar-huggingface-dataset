# thienluuaz/pubg-steam-no-recoil-macro-loot-esp

## Resumen

El repositorio `thienluuaz/pubg-steam-no-recoil-macro-loot-esp` no contiene un modelo de inteligencia artificial. Se trata de un artefacto etiquetado en Hugging Face como si fuese un modelo, pero cuya model card describe un ejecutable para Windows (`dandys-world-forsaken-script-2026-v1.2.2-win64.exe`) presentado como macro de retroceso nulo, filtro de loot y ESP para el videojuego PUBG en Steam. No hay pesos, ni arquitectura de red neuronal, ni tokenizador, ni pipeline de inferencia asociado.

El artefacto se publicó el 24 de noviembre de 2026 con licencia MIT declarada, cero descargas y cero likes. Los metadatos de idioma (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) y las etiquetas (`windows`, `windows-11`, `x64`, `portable`) corresponden a la distribución de un binario, no a las capacidades lingüísticas de un modelo.

Desde la perspectiva de evaluación de modelos, esta ficha documenta un caso de contenido ajeno a la categoría: no es posible analizar arquitectura, entrenamiento, capacidades cognitivas ni rendimiento en benchmarks porque no existe ningún modelo subyacente. Se recomienda tratar el repositorio como software de terceros no verificado y potencialmente fraudulento, no como un modelo de IA open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no implica capacidades de modelo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto descrito es un `.zip` de 4,8 MB con un `.exe` en su interior) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. La model card describe módulos de un programa de escritorio: capa de renderizado «stream-proof», perfiles JSON intercambiables en caliente, suavizado de entrada Bézier, núcleo externo en modo usuario con renderizado por Desktop Duplication, radar 2D con filtrado de loot y una tecla de pánico (`END`). Ninguno de estos componentes se corresponde con capas, atención, MoE, SSM ni ningún paradigma de aprendizaje automático.

No se documentan datos de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni innovaciones técnicas propias de modelos generativos. Las cifras que aparecen en la model card (consistencia del 96,2 % y 96,9 %, latencias inferiores a 20 ms y 22 ms, consumo de RAM inferior a 42 MB y 30 MB) son afirmaciones del autor sobre el comportamiento del ejecutable, sin metodología de medición ni verificación independiente.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los códigos de idioma son metadatos de distribución.
- Las funciones que declara la model card son propias de un programa de asistencia en videojuegos (retroceso nulo, ESP, radar 2D, filtro de loot), no de un modelo de IA.

## Casos de uso

- No aplica: no es un modelo de IA y no puede emplearse en ninguno de los escenarios habituales de evaluación de modelos (generación, RAG, agentes, código, análisis documental).
- Auditoría de seguridad: el artefacto puede analizarse en un entorno aislado para estudiar técnicas de ingeniería social en repositorios de Hugging Face, dado el uso de contraseñas en archivos ZIP y enlaces de descarga alojados en GitHub.
- Investigación de abuso de plataforma: sirve como muestra de etiquetado engañoso (tags de modelo aplicados a un binario) para calibrar clasificadores de contenido.
- Formación en ciberseguridad: caso práctico de distribución de ejecutables no verificados bajo apariencia de recurso para desarrolladores.
- Monitorización de cumplimiento: ejemplo de conflicto entre la licencia MIT declarada y las condiciones de uso de un videojuego de terceros.
- No se recomienda su ejecución en entornos de producción, investigación ni equipos personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en memoria de GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos del artefacto descrito: Windows 10/11 de 64 bits, archivo `.zip` de 4,8 MB y contraseña `2026` para la extracción, según la model card.
- Latencia y throughput: no disponibles; las cifras de la model card (< 20 ms, < 22 ms) no son verificables ni comparables con métricas de inferencia.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el artefacto no es un modelo de IA. Frente a modelos ligeros reales (por ejemplo, familias de 1-3 mil millones de parámetros con licencia permisiva), la diferencia no es de rendimiento sino de naturaleza: aquellos tienen pesos, tokenizador y pipeline; este repositorio no.

| Criterio | Este repositorio | Modelo de IA ligero típico |
|---|---|---|
| Pesos publicados | no | sí (safetensors/GGUF) |
| Arquitectura | no disponible | transformer/MoE documentada |
| Contexto | no disponible | 4k-128k tokens |
| Benchmarks | no | MMLU, HumanEval, GSM8K |
| Licencia | MIT declarada | MIT/Apache-2.0/etc. |
| Uso previsto | ejecutable de asistencia en videojuego | inferencia de lenguaje |

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluación como modelo arrojaría resultados sin sentido.
- Ejecutable de origen no verificado, distribuido en un ZIP protegido con contraseña y alojado en un repositorio de GitHub de terceros; riesgo elevado de malware.
- Posible incumplimiento de los términos de servicio de PUBG y de la legislación sobre trampas en videojuegos; el uso puede conllevar el baneo de cuentas.
- La licencia MIT declarada no cubre necesariamente el binario ni exime de responsabilidades por daños.
- Cero descargas y cero likes: sin validación comunitaria ni señales de confianza.
- Las métricas de rendimiento de la model card son afirmaciones del autor sin reproducibilidad.
- Riesgo de suplantación de identidad del autor (`thienluuaz`) y de etiquetado engañoso en el ecosistema de Hugging Face.
- No debe desplegarse en producción, en equipos de trabajo ni en entornos con datos sensibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/thienluuaz/pubg-steam-no-recoil-macro-loot-esp
- Enlace de descarga citado en la model card (GitHub, no verificado): https://github.com/pedrolong1343/dandys-world-forsaken-script-2026/releases/download/v1.2.0/dandys-world-forsaken-script-2026-v1.2.2-win64.zip
- Releases citadas en la model card (GitHub, no verificado): https://github.com/nita7826/pubg-steam-no-recoil-macro-loot-esp/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible.
