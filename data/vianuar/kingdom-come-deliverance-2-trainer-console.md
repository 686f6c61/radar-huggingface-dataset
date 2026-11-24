# Vianuar/kingdom-come-deliverance-2-trainer-console

## Resumen

El repositorio `Vianuar/kingdom-come-deliverance-2-trainer-console` alojado en Hugging Face no contiene un modelo de inteligencia artificial, sino un paquete ejecutable para Windows distribuido a traves de la plataforma. La model card describe una supuesta "trainer console" para el videojuego *Kingdom Come: Deliverance 2*, con modulos como overlays externos, radar 2D, filtro de loot y perfiles JSON intercambiables. No existe ninguna arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia asociado.

El contenido publicado es, en la practica, un binario portable (`kingdom-come-deliverance-2-trainer-console-v1.2.0-win64.zip`, 8,9 MB) empaquetado en un ZIP protegido con contrasena y alojado en un repositorio de GitHub externo (`victoria94062/...`). La propia model card incluye enlaces de descarga directa, una contrasena fija (`2026`) y promesas de funcionalidades propias de software de trampas (cheats) para un juego de un solo jugador. Nada de esto constituye un modelo de lenguaje, vision o multimodal.

Por tanto, esta ficha no puede evaluar el artefacto como modelo de IA: no hay parametros, contexto, licencia de pesos ni benchmarks. Se documenta unicamente lo que la informacion disponible permite verificar, y se advierte de los riesgos de seguridad asociados a la ejecucion de binarios de procedencia no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows 10/11 64-bit) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo. El artefacto descrito en la model card es un ejecutable nativo de Windows de 64 bits (`kingdom-come-deliverance-2-trainer-console-v1.2.0-win64.exe`, build `v1.5.9 (284B69)`) que, segun el autor, opera en modo usuario mediante "Desktop Duplication rendering sin hooks internos de DLL" y ofrece un overlay externo. La model card menciona metricas como "97,9 % de consistencia", "291 Hz de polling", "< 31 ms de respuesta" y "< 61 MB de RAM", pero no se aporta metodologia, codigo fuente ni artefacto reproducible que permita verificarlas.

No hay informacion sobre datos de entrenamiento, tokens, composicion del dataset, RLHF, DPO ni ninguna innovacion tecnica de aprendizaje automatico. El unico proceso descrito es la descarga y extraccion de un ZIP con contrasena y la ejecucion del binario como administrador.

## Capacidades

- No es un modelo de IA: no genera texto, no razona, no programa, no resuelve matematicas ni procesa vision.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso.
- Multilingue solo en el sentido de que los metadatos declaran 14 idiomas para la interfaz o la documentacion del ejecutable, no para capacidades linguisticas de un modelo.
- Capacidades declaradas por el autor (no verificables y propias de software de trampas): overlay externo a 144 Hz o mas, radar 2D, filtro de loot por rareza, ESP de cajas 2D/3D y esqueletos, perfiles JSON intercambiables con una tecla, tecla de panico `END` para descarga asincrona.
- No hay modo "thinking", ni vision, ni audio, ni ninguna capacidad cognitiva.

## Casos de uso

- No aplica como modelo de IA: no se puede desplegar en pipelines de NLP, generacion de codigo, atencion al cliente, RAG ni analisis de datos.
- Uso declarado por el autor: modificacion de la experiencia de juego en *Kingdom Come: Deliverance 2* en un PC con Windows 10/11 de 64 bits, mediante un ejecutable que se lanza como administrador.
- Escenario de riesgo a documentar: descarga y ejecucion de binarios de procedencia no verificada con contrasena fija, lo que impide el analisis previo del contenido por parte de antivirus y motores de analisis estatico.
- Escenario de investigacion: uso como caso de estudio de distribucion de software potencialmente malicioso en plataformas de modelos (abuso de Hugging Face como CDN).
- Escenario de moderacion de plataformas: ejemplo de repositorio que incumple las politicas de contenido de modelos al no contener un modelo y redirigir a descargas externas.
- Escenario de formacion en seguridad: ilustracion de tecnicas de ingenieria social (badges de "Rating 4.8/5", "Build v1.5.9", enlaces directos, contrasena en la propia pagina) para aumentar la tasa de conversion de victimas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card ("97,9 % de consistencia", "291 Hz", "< 31 ms", "< 61 MB de RAM") son afirmaciones del autor sin metodologia ni evidencia reproducible, y no corresponden a ningun benchmark estandar de IA (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- Sistema operativo: Windows 10 o Windows 11 de 64 bits (x64), segun la model card.
- VRAM: no aplica (no hay modelo de IA que cargar en GPU).
- GPU recomendada: no disponible; el autor menciona un overlay "144 Hz+" pero no especifica hardware.
- Cabe en cualquier PC consumer con Windows x64 segun el tamano del paquete (8,9 MB), aunque el consumo real del binario no es verificable.
- Opciones de despliegue: no aplica (no hay vLLM, llama.cpp, Ollama ni TGI). El unico despliegue descrito es ejecutar el `.exe` como administrador.
- Latencia y throughput: no disponibles de forma verificable.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Vianuar/kingdom-come-deliverance-2-trainer-console` | Ejecutable Windows (no modelo IA) | no disponible | no disponible | MIT (declarada) | Hugging Face + GitHub externo |
| Modelos de lenguaje open source (p. ej. familias Llama, Mistral, Qwen) | LLM transformer | miles de millones | miles de tokens | licencias abiertas variables | Hugging Face, repositorios oficiales |
| Modelos multimodales open source (p. ej. familias LLaVA, Qwen-VL) | Vision-lenguaje | miles de millones | miles de tokens | licencias abiertas variables | Hugging Face |

No existe comparacion tecnica posible con modelos de IA porque el artefacto no es un modelo. La comparativa se limita a senalar que pertenece a una categoria distinta (software de escritorio) y que su presencia en Hugging Face es atipica.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal en pipelines de NLP, vision o agentes.
- Riesgo de seguridad alto: distribucion de un binario Windows protegido con contrasena fija (`2026`) y alojado en un repositorio de GitHub de terceros, lo que dificulta el analisis automatico y favorece la introduccion de malware.
- La model card emplea tecnicas de persuasion (badges de valoracion, build, enlaces de descarga destacados) propias de campanas de distribucion de software no verificado.
- Las metricas declaradas no son reproducibles ni auditables; no hay codigo fuente publicado en el repositorio de Hugging Face.
- La licencia MIT declarada en los metadatos no acompana necesariamente al binario distribuido en GitHub; no hay garantia de que el contenido del ZIP corresponda a lo descrito.
- Uso comercial: no aplica como modelo; el uso del ejecutable puede infringir los terminos de servicio del videojuego y las politicas de la plataforma que lo aloja.
- Idiomas: los 14 idiomas declarados corresponden a metadatos del repositorio, no a capacidades linguisticas verificadas.
- Sesgos y alucinacion: no aplica en el sentido de un LLM, pero la model card contiene afirmaciones no verificadas que pueden inducir a error al lector.
- Recomendacion: no ejecutar el binario en entornos de produccion ni en maquinas con datos sensibles; si se analiza, hacerlo en una maquina virtual aislada y sin red.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Vianuar/kingdom-come-deliverance-2-trainer-console
- Repositorio GitHub referenciado en la model card: https://github.com/victoria94062/kingdom-come-deliverance-2-trainer-console
- Descarga directa referenciada (ZIP, 8,9 MB): https://github.com/victoria94062/kingdom-come-deliverance-2-trainer-console/releases/latest/download/kingdom-come-deliverance-2-trainer-console-v1.2.0-win64.zip
- Pagina de releases: https://github.com/victoria94062/kingdom-come-deliverance-2-trainer-console/releases/latest
