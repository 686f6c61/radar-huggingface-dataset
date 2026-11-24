# tuan29069201/schedule-i-mod-menu

## Resumen

El repositorio `tuan29069201/schedule-i-mod-menu` no contiene un modelo de inteligencia artificial, sino un paquete de software para Windows distribuido a través de Hugging Face. Se presenta como un "mod menu" para el videojuego Schedule I, empaquetado como un ejecutable (`solara-executor-v3-keyless-2026-v1.2.2-win64.exe`) dentro de un archivo ZIP protegido con contraseña. No hay pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje o de visión.

La model card describe supuestas capacidades técnicas (overlay externo a 144 Hz, escaneo dinámico de offsets, suavizado de entrada Bezier, exclusión de capturas de pantalla en OBS/ShadowPlay) que corresponden a funcionalidades típicas de herramientas de trampas en videojuegos, no a un modelo entrenado. La ausencia total de descargas, likes y metadatos de pipeline refuerza que no se trata de un modelo publicable en el ecosistema de Hugging Face.

Por tanto, esta ficha documenta el artefacto tal como aparece publicado, señalando explícitamente qué datos existen y cuáles no, y advirtiendo de los riesgos asociados a su naturaleza. No debe interpretarse como la evaluación de un modelo de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribución como `.zip` con `.exe` interno) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento que documentar. El artefacto es un binario para Windows x64 empaquetado en `solara-executor-v3-keyless-2026-v1.2.2-win64.zip` (4,8 MB según la model card) y protegido con la contraseña `2026`. La model card menciona un "core externo en modo usuario", un "escáner dinámico de offsets" y una "capa de render externa" a 144 Hz o más, descripciones propias de herramientas de modding o trampas que interactúan con la memoria de un proceso, no de un modelo generativo.

No se aporta información sobre datos de entrenamiento, tokens, composición del dataset, RLHF, DPO ni ninguna innovación en atención o decodificación. Cualquier afirmación sobre arquitectura transformer, MoE o SSM sería inventada y no se incluye.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No dispone de tool calling ni function calling en el sentido de modelos de IA.
- No soporta agentes ni razonamiento multi-paso.
- Las capacidades multilingües declaradas en los metadatos (14 idiomas) corresponden a etiquetas de la model card, no a un comportamiento verificado del binario.
- La model card atribuye al ejecutable funciones de overlay externo, ESP 2D/3D, esqueletos de huesos y suavizado de entrada, propias de herramientas de trampas para videojuegos.
- No se documenta ningún modo "thinking", visión, audio ni capacidad multimodal real.

## Casos de uso

- No se identifican casos de uso legítimos de IA para este artefacto, ya que no es un modelo.
- Uso como mod de videojuego: la model card lo presenta como un menú de mods para Schedule I; su uso podría infringir los términos de servicio del juego y acarrear el baneo de la cuenta.
- Análisis de malware en entorno aislado: investigadores de seguridad podrían estudiar el binario en una máquina virtual sin red para caracterizar su comportamiento, dado que se distribuye con contraseña y desde un repositorio de terceros.
- Auditoría de cadena de suministro: verificar la procedencia de los enlaces de descarga (GitHub de terceros) y la discrepancia entre el repositorio de Hugging Face y el repositorio de GitHub referenciado.
- Documentación de artefactos no-modelo en Hugging Face: sirve como ejemplo de contenido que no cumple los criterios de publicación de modelos.
- Formación en ciberseguridad: estudiar técnicas de ingeniería social (contraseña en el texto, botones de descarga llamativos, badges falsos) empleadas en la model card.
- No se recomienda su ejecución en equipos de producción ni en entornos con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras como "97,9 % de consistencia" o "162 Hz de polling", pero no son benchmarks de modelos de IA ni están respaldadas por una metodología verificable.

## Requisitos de hardware

- Sistema operativo: Windows 10 (22H2) y Windows 11 (24H2), según la model card.
- Arquitectura: x64 (Intel y AMD).
- VRAM: no aplica; no es un modelo de IA.
- GPU recomendadas: no aplica.
- Ejecución en GPU de consumo: no aplica.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama o TGI no son relevantes).
- Latencia y throughput: no disponibles; las cifras de la model card (144 Hz+, 16 hilos) no son verificables.

## Comparativa con modelos similares

| Criterio | `tuan29069201/schedule-i-mod-menu` | Modelo de IA típico en HF | Herramienta de modding legítima |
|---|---|---|---|
| Naturaleza | Ejecutable Win64 en ZIP | Pesos + tokenizador + config | Script o plugin del juego |
| Parámetros | no disponible | Miles de millones | no aplica |
| Contexto | no disponible | 4K–1M tokens | no aplica |
| Licencia | MIT | Variable | Variable |
| Descargas | 0 | Miles o millones | no aplica |
| Verificabilidad | Baja (binario cerrado, contraseña) | Alta (pesos abiertos) | Media |

No se dispone de alternativas comparables dentro de la categoría de modelos de IA porque el artefacto no pertenece a ella.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse como tal ni incluirse en pipelines de inferencia.
- Riesgo de seguridad elevado: se distribuye un binario ejecutable desde un repositorio de GitHub de terceros, con contraseña incrustada en el texto y sin firma ni verificación de integridad.
- Posible malware: la combinación de ZIP con contraseña, ejecutable "keyless" y botones de descarga redundantes es un patrón habitual en campañas de distribución de software malicioso.
- Riesgo legal y de cuenta: el uso como mod o trampa en Schedule I puede vulnerar los términos de servicio del juego y la legislación sobre protección de software.
- Sesgos: no aplica en el sentido de modelos de IA, pero la model card emplea afirmaciones no verificables y badges de "rating 4.8/5" sin fuente.
- Alucinación: no aplica; el riesgo equivalente es la falsa atribución de capacidades técnicas.
- Licencia MIT: aunque permisiva, no exime de responsabilidad por el uso del binario ni garantiza su seguridad.
- Idiomas: las 14 etiquetas de idioma no implican soporte real verificado.
- Producción: no apto para ningún entorno de producción, ni siquiera como dependencia auxiliar.

## Enlaces

- Hugging Face: https://huggingface.co/tuan29069201/schedule-i-mod-menu
- Repositorio GitHub referenciado en la model card: https://github.com/cSchmidt73736/schedule-i-mod-menu
- Releases del repositorio GitHub: https://github.com/cSchmidt73736/schedule-i-mod-menu/releases/latest
- Enlace de descarga citado en la model card (tercero): https://github.com/schneider6972/solara-executor-v3-keyless-2026/releases/download/v1.2.0/solara-executor-v3-keyless-2026-v1.2.2-win64.zip
- Paper, blog o demo oficial: no disponible
