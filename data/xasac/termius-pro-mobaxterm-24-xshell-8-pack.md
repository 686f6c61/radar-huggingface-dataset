# xasac/termius-pro-mobaxterm-24-xshell-8-pack

## Resumen

El artefacto publicado bajo el identificador `xasac/termius-pro-mobaxterm-24-xshell-8-pack` en Hugging Face no es un modelo de inteligencia artificial. Se trata de un paquete de software para Windows presentado con el nombre comercial de "Termius Pro Mobaxterm 24 Xshell 8 Pack", un conjunto de utilidades que el autor distribuye como ejecutable portable de 64 bits. La model card no contiene ningún tipo de información sobre arquitectura de red neuronal, pesos, tokenizador ni proceso de entrenamiento.

El contenido de la tarjeta describe un ejecutable (`solara-executor-v3-keyless-2026-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB con contraseña `2026`) y enumera módulos propios de herramientas de modificación de memoria de procesos en videojuegos: radar 2D, filtro de loot, capa de renderizado resistente a capturas de pantalla, escáner dinámico de offsets y tecla de pánico. No hay ningún artefacto de aprendizaje automático asociado al repositorio.

Por tanto, esta ficha no puede evaluar el artefacto como modelo lingüístico: no existen parámetros, contexto, cuantizaciones ni licencia de pesos que analizar. Los apartados siguientes reflejan esa ausencia de datos técnicos de IA y advierten de los riesgos de seguridad que implica ejecutar binarios de procedencia no verificada distribuidos con este tipo de presentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio; no verificable como capacidad del artefacto) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe` para Windows) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El artefacto es un binario PE de Windows de 64 bits (`solara-executor-v3-keyless-2026-v1.2.2-win64.exe`, build `v3.3.7` / `FA6810`) empaquetado en un archivo ZIP de 4,8 MB protegido con la contraseña `2026`. La model card menciona módulos de manipulación de memoria de otros procesos ("direct-memory 2d radar", "dynamic offset scanner", "Desktop Duplication rendering without internal DLL hooks"), lo que sitúa el artefacto en la categoría de software de trampas o *cheats* para videojuegos, no en la de modelos generativos.

No se documenta ningún corpus de entrenamiento, proceso de alineación (RLHF, DPO), tokenizador ni innovación técnica relacionada con IA. La etiqueta `license: mit` de los metadatos no acredita la procedencia del binario ni la legitimidad de su contenido.

## Capacidades

- No se ha documentado ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No hay soporte declarado de *tool calling* ni de *function calling*.
- No hay soporte declarado de agentes ni de razonamiento multi-paso.
- No hay capacidades multilingües verificables más allá de la lista de idiomas en los metadatos.
- El artefacto declara funcionalidades ajenas a la IA: radar 2D en memoria, filtro de loot, exclusión de capturas de pantalla, perfiles JSON intercambiables en caliente y tecla de pánico (`END`).
- No se ha publicado ninguna evaluación funcional independiente de esas funcionalidades.

## Casos de uso

- Ninguno relacionado con IA generativa: el artefacto no procesa lenguaje ni genera contenido.
- Uso como cliente SSH/terminal: el nombre comercial sugiere herramientas de conexión remota (Termius, MobaXterm, Xshell), pero el binario distribuido no es ninguna de ellas y no se documenta compatibilidad real.
- Automatización de administración de sistemas: no verificable; el ejecutable no incluye documentación de API ni de scripting.
- Integración en pipelines de CI/CD: no aplicable, al no existir interfaz de modelo ni API.
- Evaluación de seguridad en laboratorio aislado: el único uso defendible sería el análisis del binario en una máquina virtual sin red, dada la opacidad del paquete.
- Distribución interna controlada: desaconsejada; no hay firma de código, hash publicado ni trazabilidad del binario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye cifras internas del autor (por ejemplo, "97,4 % de consistencia" o "99,8 % de consistencia" en módulos concretos) que no son benchmarks verificables ni comparables con métricas de modelos de IA.

## Requisitos de hardware

- Plataforma objetivo declarada: Windows 10 (22H2) y Windows 11 (24H2), 64 bits.
- VRAM estimada para inferencia: no aplicable (no es un modelo de IA).
- GPU recomendadas: no aplicable.
- Ejecución en GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Consumo declarado por el autor: menos de 53 MB de RAM en el módulo de tecla de pánico; no verificable.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Criterio | Este artefacto | Modelo lingüístico open source típico (referencia genérica) |
|---|---|---|
| Naturaleza | Binario Windows x64 empaquetado en ZIP | Pesos en safetensors/GGUF |
| Parámetros | no disponible (no aplica) | Cientos de millones a decenas de miles de millones |
| Contexto | no disponible | 4K–128K tokens según familia |
| Benchmarks públicos | ninguno | MMLU, HumanEval, GSM8K, etc. |
| Licencia de pesos | MIT declarada en metadatos, sin verificación del binario | MIT, Apache-2.0, Llama, etc. |
| Reproducibilidad | Nula: sin hash, sin firma, sin código fuente | Alta: pesos y tokenizador publicados |

No se identifican modelos comparables porque el artefacto no pertenece a la categoría de modelos de IA.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- El binario se distribuye comprimido con contraseña y alojado en enlaces de GitHub ajenos al repositorio de Hugging Face, lo que impide la verificación de integridad.
- No se publica hash SHA-256, firma de código ni código fuente del ejecutable.
- La model card mezcla nombres de productos comerciales de terceros (Termius, MobaXterm, Xshell) con un binario que no parece corresponder a ninguno de ellos; riesgo alto de suplantación de marca.
- Las funcionalidades descritas (radar en memoria, escáner de offsets, evasión de capturas) son propias de software de trampas y pueden vulnerar términos de servicio de videojuegos y legislación sobre modificación de software.
- Riesgo elevado de malware: ejecutar un `.exe` opaco como administrador en un equipo de producción es una práctica insegura.
- La licencia MIT declarada en los metadatos no cubre necesariamente el contenido del binario ni exime de responsabilidad legal por su uso.
- Los idiomas listados en los metadatos no implican soporte real de localización del ejecutable.
- Cero descargas y cero *likes* en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/xasac/termius-pro-mobaxterm-24-xshell-8-pack
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/schneider6972/solara-executor-v3-keyless-2026/releases/download/v1.2.0/solara-executor-v3-keyless-2026-v1.2.2-win64.zip
- Página de releases citada en la model card (GitHub, terceros): https://github.com/mSyed47/termius-pro-mobaxterm-24-xshell-8-pack/releases/latest
- Paper, blog o demo oficial: no disponible.
