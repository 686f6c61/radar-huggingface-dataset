# sowel/murder-mystery-2-script

## Resumen

El repositorio `sowel/murder-mystery-2-script` no contiene un modelo de inteligencia artificial, sino un paquete de software para Windows et un artefacto de tipo "script" orientado al videojuego Murder Mystery 2. La model card publicada describe un ejecutable portable (`rob-run-cheat-mod-menu-2026-v1.2.2-win64.exe`, version v1.7.8, build 144B29) distribuido en un archivo ZIP de 4,8 MB protegido con contrasena, junto con modulos de teletransporte, optimizacion de framerate, salto de servidores, configuracion JSON persistente, bucles de farmeo automatizado y ESP de entidades. No se trata de un modelo de lenguaje, no tiene pesos neuronales ni arquitectura transformer, y no se ha entrenado con corpus de texto.

El "modelo" se etiqueta en Hugging Face con idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) y la licencia MIT, pero estas etiquetas corresponden a la metadata del repositorio, no a capacidades linguisticas reales de un modelo. El pipeline no esta definido y el numero de descargas y likes es cero en el momento de la consulta.

Por tanto, esta ficha no puede evaluar el artefacto como modelo de IA: no hay parametros, contexto, cuantizaciones ni benchmarks. La relevancia tecnica para desarrolladores e investigadores es nula en el ambito de IA open source, y su presencia en Hugging Face constituye un caso de uso anomalo del repositorio (distribucion de binarios ajenos al ecosistema de modelos). Se documenta aqui por rigor, indicando explicitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadata del repositorio, no verificado como capacidad del artefacto) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un .exe; no hay safetensors, GGUF ni ONNX) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre arquitectura de red neuronal, datos de entrenamiento, tokens procesados, composicion del dataset ni tecnicas de alineacion (RLHF, DPO). El artefacto descrito en la model card es un binario Windows x64 con modulos funcionales (teletransporte, ESP, hopper de servidores, farm loop) que operan sobre el cliente del juego Murder Mystery 2. No existe proceso de entrenamiento de IA asociado.

La unica "innovacion" documentada en la model card son afirmaciones de rendimiento del binario (respuesta en menos de 31 ms, uso de RAM inferior a 52 MB, 9 hilos de trabajo), sin metodologia de medicion ni verificacion independiente. No hay publicacion tecnica, paper ni repositorio de codigo fuente que respalde estas cifras.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no responde a prompts.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No tiene modo de razonamiento multi-paso ni capacidades de agente.
- No procesa vision, audio ni modalidades de entrada.
- Las capacidades reales descritas son las de un mod menu para un videojuego: teletransporte de coordenadas, optimizacion de framerate, salto de servidores, guardado de configuracion JSON, bucles de farmeo y ESP de entidades.
- El multilingue declarado en la metadata no se corresponde con ninguna funcionalidad linguistica verificable del artefacto.

## Casos de uso

- No aplica: el artefacto no es un modelo de IA y no tiene casos de uso en generacion de texto, codigo, atencion al cliente, analisis de datos ni pipelines de ML.
- Distribucion de binarios en Hugging Face: el repositorio ilustra un uso atipico de la plataforma para alojar ejecutables ajenos al ecosistema de modelos, lo que puede interesar a equipos de moderacion y gobernanza de plataformas.
- Estudio de casos de abuso de plataformas: util para analizar patrones de publicacion de contenido no relacionado con IA en repositorios de modelos.
- Analisis de seguridad: el patron de ZIP con contrasena y enlace a binario externo es un vector de riesgo que puede servir como ejemplo en formacion de analistas.
- Investigacion sobre etiquetado incorrecto: la metadata declara idiomas y licencia que no reflejan la naturaleza del artefacto, lo que resulta util para estudiar fallos de clasificacion automatica.
- No se identifican casos de uso legitimos de IA para este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion de modelos, dado que el artefacto no es un modelo de IA. Las cifras de rendimiento del binario (menos de 31 ms de respuesta, menos de 52 MB de RAM) no son benchmarks de IA y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay inferencia de red neuronal).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma objetivo declarada: Windows 10 u 11 de 64 bits en escritorio x64.
- Opciones de despliegue: ejecucion directa del binario `rob-run-cheat-mod-menu-2026-v1.2.2-win64.exe` tras extraer el ZIP con contrasena; no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible como metrica de IA; las cifras del binario no son verificables.

## Comparativa con modelos similares

| Criterio | sowel/murder-mystery-2-script | Modelo de IA open source tipico (referencia generica) |
|---|---|---|
| Naturaleza | Ejecutable Windows x64 (mod menu) | Red neuronal con pesos publicados |
| Parametros | no disponible | Variable (1B-70B+) |
| Contexto | no disponible | 4K-128K+ |
| Licencia | MIT | Variable (Apache 2.0, MIT, Llama, etc.) |
| Formato de pesos | ZIP con .exe | safetensors, GGUF, ONNX |
| Benchmarks de IA | no disponible | MMLU, HumanEval, GSM8K, etc. |
| Disponibilidad | Hugging Face (0 descargas) | Hugging Face, GitHub, mirrors |

No se identifican modelos comparables de la misma categoria porque el artefacto no pertenece a ninguna categoria de modelo de IA.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier evaluacion como LLM carece de sentido.
- La model card incluye enlaces a binarios alojados en GitHub de terceros, con contrasena de extraccion y ejecucion como administrador; este patron es un vector clasico de distribucion de malware y debe tratarse con extrema cautela.
- Las afirmaciones de rendimiento (573K descargas, 99% de valoracion, menos de 31 ms) no son verificables y no proceden de fuentes independientes.
- El etiquetado de idiomas y licencia MIT no refleja capacidades reales del artefacto.
- El uso de mod menus en videojuegos multijugador puede violar los terminos de servicio del juego y acarrear sanciones de cuenta.
- No hay codigo fuente publico, paper ni auditoria de seguridad del binario.
- Riesgo de alucinacion: no aplica; riesgo de malware: no evaluado pero plausible dado el patron de distribucion.
- Para produccion en IA: no utilizable.

## Enlaces

- Hugging Face: https://huggingface.co/sowel/murder-mystery-2-script
- Model card del autor: incluida en la pagina de Hugging Face arriba enlazada
- Enlace de descarga citado en la model card (GitHub de terceros): https://github.com/JoaoSchaefer973/rob-run-cheat-mod-menu-2026/releases/download/v1.2.0/rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip
- Repositorio citado en la model card: https://github.com/DominiqueMorales60/murder-mystery-2-script
- Resultados de busqueda web: no relacionados con el artefacto (corresponden a la cadena hotelera Sowell y a la aplicacion SoWell, sin vinculacion con el repositorio de Hugging Face)
