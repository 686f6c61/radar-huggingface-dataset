# Tinghong-Ye22/code-GMR

## Resumen

GMR (General Motion Retargeting) es un framework de retargeting de movimiento humano a robots humanoides, publicado en el repositorio de HuggingFace `Tinghong-Ye22/code-GMR` (tamano del repo: 0,8 GB) y desarrollado en torno al trabajo de Yanjie Ze y colaboradores. No se trata de un modelo de lenguaje ni de una red generativa de texto: es una herramienta de software que convierte movimiento humano capturado (datos BVH, FBX, LAFAN1, video monoculo, etc.) en trayectorias articulares ejecutables por distintos robots humanoides, mediante un solucionador de cinematica inversa (IK) configurable.

El problema que resuelve es el cuello de botella del retargeting en robotica humanoide: cada robot tiene un numero de grados de libertad (DoF), limites de articulacion y limites de velocidad de motor distintos, y cada fuente de captura de movimiento usa un esqueleto y un formato propios. GMR unifica esa conversion con una unica clase `GeneralMotionRetargeting`, con retargeting en tiempo real de alta calidad, y esta ajustado para que las politicas de tracking por aprendizaje por refuerzo (RL) rindan correctamente sobre el movimiento resultante.

Es relevante ahora porque habilita teleoperacion de cuerpo completo en tiempo real (por ejemplo, la pila TWIST y TWIST2) y porque su ecosistema crece rapido: en el momento de redactar esta ficha soporta 17 robots humanoides y multiples formatos de movimiento humano, con licencia MIT. Los datos de benchmarks, parametros y cuantizacion propios de un modelo de lenguaje no aplican a este repositorio y no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible; no es un modelo neuronal de lenguaje, es un framework de retargeting de movimiento basado en cinematica inversa (IK) con configuracion por robot |
| Parametros totales | no aplica (no es un modelo con pesos neuronales publicados en la ficha) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica / no disponible |
| Idiomas soportados | no aplica (herramienta de codigo, no modelo linguistico); idiomas de la documentacion no disponibles |
| Licencia | MIT (segun el badge de licencia incluido en el README) |
| Formato de pesos | no disponible; el repositorio distribuye ficheros de robot (`.xml`, `.urdf` y meshes) y ficheros de movimiento (pickle de GMR, CSV, BVH, FBX) |
| Version | 0.2.0 |
| Tamano del repositorio | 0,8 GB |
| Robots humanoides soportados | 17 segun el registro de novedades del README |
| Formatos de movimiento soportados | LAFAN1, BVH (Xsens, Nokov), FBX offline de OptiTrack, video monoculo via GVHMR, pickle GMR y CSV |

## Arquitectura y entrenamiento

La informacion disponible describe un pipeline de retargeting, no un entrenamiento de red neuronal. El nucleo es un solucionador de cinematica inversa configurable (el README menciona un documento especifico de configuracion IK, `DOC.md`, anadido el 2025-10-14) que recibe movimiento humano y produce juntas de robot respetando sus limites. La clase `GeneralMotionRetargeting` incorpora por defecto `use_velocity_limit=True` con un limite de velocidad de 3*pi, y expone los nombres e identificadores de DoF, cuerpos y motores del robot a traves de los atributos `robot_dof_names`, `robot_body_names` y `robot_motor_names`.

En cuanto a datos e innovaciones, la ficha del autor no detalla volumen de tokens ni composicion de dataset, porque no aplica a este tipo de herramienta. Entre las capacidades tecnicas destacadas estan el retargeting en tiempo real de alta calidad, el ajuste fino orientado a que las politicas de tracking por RL funcionen bien sobre la salida, el soporte de multiples robots y formatos, y la integracion con GVHMR para extraer pose humana desde video monoculo. Existe un informe tecnico en arXiv (2510.02252) y un articulo previo (2505.02833) que probablemente contienen los detalles metodologicos, pero los numeros concretos no se facilitan en la informacion disponible.

## Capacidades

- Retargeting de movimiento humano a robot humanoide en tiempo real, pensado para teleoperacion de cuerpo completo.
- Soporte de 17 robots humanoides distintos, entre ellos Unitree G1 (incluida la variante con manos Dex31), Unitree H1 y H1 2, Booster T1 (23 y 29 DoF), Booster K1, Berkeley Humanoid Lite, HighTorque Hi, Galaxea R1 Pro (robot con ruedas), KUAVO, Tienkung, PAL Robotics Talos, PND Adam Lite, Fourier GR3 y otros.
- Entrada de multiples formatos de movimiento humano: LAFAN1, BVH offline de Xsens y Nokov, FBX offline exportado de OptiTrack, video monoculo procesado con GVHMR, ficheros pickle de GMR y CSV.
- Respeto de limites de velocidad de motor del robot (`use_velocity_limit=True`, valor por defecto 3*pi).
- Inspeccion programatica de la estructura del robot mediante `robot_dof_names`, `robot_body_names` y `robot_motor_names`.
- Conversion por lotes de ficheros pickle de GMR a CSV (`scripts/batch_gmr_pkl_to_csv.py`).
- Integracion con pilas de RL tracking (TWIST, TWIST2 con XRoboToolkit SDK) y con MimicKit de Jason Peng mediante conversion de formato `gmr_to_mimickit`.
- Soporte de configuracion IK por robot documentado en `DOC.md`.
- No es un modelo de lenguaje: no ofrece generacion de texto, razonamiento, codigo, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Teleoperacion de cuerpo completo en tiempo real: GMR actua como capa de retargeting entre el operador humano y el robot, de modo que el movimiento capturado se convierte en comandos articulares ejecutables por el humanoide. Es la base de las pilas TWIST y TWIST2.
- Entrenamiento de politicas de tracking por RL: al producir trayectorias de referencia ajustadas a los limites del robot, GMR sirve para generar los datos de movimiento con los que se entrenan politicas de control que despues reproducen esas trayectorias.
- Reutilizacion de capturas de movimiento existentes: un equipo con datos LAFAN1 o BVH de Xsens/Nokov puede retargetearlos a cualquier robot soportado sin reescribir su pipeline de animacion.
- Captura de movimiento sin traje desde video monoculo: combinando GMR con GVHMR, se puede extraer la pose humana de un video y retargetearla al robot, lo que abarata la generacion de demostraciones.
- Investigacion en loco-manipulacion y control: comparar como un mismo movimiento humano se resuelve en arquitecturas humanoides distintas (por ejemplo, 23 frente a 29 DoF en Booster T1), usando los nombres de DoF y motor expuestos por la clase principal.
- Integracion con herramientas de animacion y simulacion existentes: la conversion a formato MimicKit permite llevar movimientos de GMR a ese ecosistema, y la exportacion a CSV facilita su uso en pipelines de analisis o entrenamiento.
- Produccion de datasets de movimiento para robots: la conversion por lotes de pickle a CSV permite generar corpus de movimiento homogeneos para experimentos reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos indicios de evaluacion son la existencia de dos articulos en arXiv (2505.02833 y 2510.02252) y el material de demostracion (videos de retargeting de movimiento de baile de LAFAN1 a cinco robots, entre otros), pero no se proporcionan cifras concretas de error de tracking, latencia ni exito de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no es un modelo con pesos neuronales cuyo consumo se haya publicado en la ficha).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible en la informacion proporcionada; el README no documenta contenedores, servidores de inferencia ni integraciones tipo vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a esta herramienta.
- Latencia y throughput: no disponible; la ficha afirma retargeting en tiempo real, pero sin cifras de latencia ni de frecuencia de actualizacion.

## Comparativa con modelos similares

No se dispone de datos comparativos (parametros, contexto, rendimiento, licencia) en la informacion proporcionada. Los proyectos relacionados que aparecen citados en la model card no son alternativas equivalentes, sino componentes de un mismo ecosistema:

| Proyecto | Relacion con GMR | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| GMR | Framework de retargeting objeto de esta ficha | no aplica | no aplica | MIT |
| TWIST / TWIST2 | Pilas de teleoperacion y RL tracking que consumen GMR | no disponible | no disponible | no disponible |
| GVHMR | Extraccion de pose humana desde video monoculo, integrable en el pipeline de GMR | no disponible | no disponible | no disponible |
| MimicKit (Jason Peng) | Herramienta que admite el formato GMR mediante `gmr_to_mimickit` | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: cualquier expectativa de generacion de texto, razonamiento, codigo o tool calling queda fuera del alcance del repositorio.
- La ficha del modelo no declara idiomas soportados, pipeline ni licencia en los metadatos de HuggingFace; la licencia MIT consta unicamente en el badge del README, por lo que conviene verificarla en el fichero `LICENSE` del repositorio antes de un uso comercial.
- El soporte de un nuevo robot o de un nuevo formato de movimiento depende de que el autor reciba los ficheros correspondientes (`.xml`, `.urdf` y meshes) y de que estos puedan abrirse en el repositorio; no es un proceso automatico.
- La calidad del retargeting depende del ajuste de la configuracion IK por robot; el README remite a `DOC.md` como unica documentacion especifica, sin garantias de cobertura para todos los robots.
- El rendimiento de las politicas de RL aguas abajo depende indirectamente de la calidad del retargeting; no se publican metricas de error en la informacion disponible.
- La extraccion de pose desde video monoculo (via GVHMR) es una dependencia externa y puede introducir ruido adicional en el movimiento retargeteado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las fechas de creacion y actualizacion son posteriores a las de las notas de novedades; no hay senales de adopcion publica en la propia plataforma.
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo, por lo que no hay fuentes externas independientes que confirmen o amplien la informacion del autor.

## Enlaces

- HuggingFace: https://huggingface.co/Tinghong-Ye22/code-GMR
- Paper (arXiv 2505.02833): https://arxiv.org/abs/2505.02833
- Informe tecnico de GMR (arXiv 2510.02252): https://arxiv.org/abs/2510.02252
- Repositorio y releases en GitHub: https://github.com/YanjieZe/GMR/releases
- Blog de GMR: https://yanjieze.github.io/humanoid-foundation/#GMR
- Tutorial en Bilibili: https://www.bilibili.com/video/BV1p1nazeEzC/
- Anuncio inicial en X/Twitter: https://x.com/ZeYanjie/status/1952446745696469334
- TWIST (RL motion tracking): https://github.com/YanjieZe/TWIST
- TWIST2: https://yanjieze.com/TWIST2
- XRoboToolkit SDK (usado por TWIST2): https://github.com/XR-Robotics/XRoboToolkit-PC-Service
- GVHMR (pose desde video monoculo): https://github.com/zju3dv/GVHMR
- MimicKit (conversion de formato GMR): https://github.com/xbpeng/MimicKit/tree/main/tools/gmr_to_mimickit
- Berkeley Humanoid Lite (assets): https://github.com/HybridRobotics/Berkeley-Humanoid-Lite-Assets
- TienKung Lab: https://github.com/Open-X-Humanoid/TienKung-Lab
