# ywsldxk1/mujoco-cn

## Resumen

mujoco-cn es un simulador de escritorio para robótica construido sobre MuJoCo 3.17.0, publicado por el usuario ywsldxk1 en HuggingFace. No se trata de un modelo de lenguaje ni de una red neuronal con pesos entrenados: es una aplicación Python con interfaz gráfica que envuelve el motor físico MuJoCo y añade una capa de usabilidad orientada a la teleoperación de un brazo robótico SO-101. El repositorio en HuggingFace tiene un tamaño de 0.0 GB, lo que confirma que no contiene checkpoints ni artefactos de modelo.

La herramienta resuelve un problema de ergonomía: MuJoCo es un motor de simulación física de referencia en robótica, pero su uso directo requiere escribir código o manejar visores poco amigables. mujoco-cn ofrece un menú lateral en chino, control por teclado del brazo SO-101, importación de mallas OBJ/STL y ficheros MJCF, y visualización de articulaciones y contactos. Está pensado para Windows con Python 3.11 o superior.

Su relevancia es acotada: sirve como utilidad docente y de prototipado rápido para quienes trabajan con el modelo SO-101 de The Robot Studio disponible en MuJoCo Menagerie. No debe confundirse con un modelo fundacional ni evaluarse con benchmarks de IA. La licencia del código es Apache-2.0, igual que MuJoCo y el modelo Menagerie que descarga en tiempo de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aplicación de escritorio Python sobre el motor físico MuJoCo 3.17.0 (no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica; no contiene pesos entrenados) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | Interfaz en chino simplificado; README también en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no aplica; el repo no contiene pesos) |

## Arquitectura y entrenamiento

mujoco-cn no es un modelo entrenado. Es una aplicación de escritorio que integra el motor de simulación física MuJoCo 3.17.0 mediante su API Python y construye una interfaz gráfica con menús plegables, vista de escena central y panel de control de articulaciones. El robot por defecto es el SO-101 de The Robot Studio, tomado de MuJoCo Menagerie (`robotstudio_so101`), que se descarga en tiempo de ejecución y no se redistribuye en el repositorio.

La capa de importación de objetos (`object_import.py`) acepta mallas OBJ y STL, las envuelve como cuerpos móviles y genera geometría de colisión por envolvente convexa, además de ficheros MJCF independientes para objetos con colisión simplificada. Al importar, el programa recompila la escena preservando las poses actuales del brazo y del objeto de demostración. No hay datos de entrenamiento, RLHF ni proceso de ajuste asociado.

## Capacidades

- Teleoperación por teclado del brazo SO-101: W/S para elevación de hombro, A/D para giro de hombro, I/K para codo, J/L para rotación de muñeca, Ctrl izquierdo/derecho para inclinación de muñeca, C/B para cerrar pinza, V/N para abrir pinza y espacio para conmutar la pinza.
- Menú lateral en chino simplificado con plegado izquierdo/derecho, manteniendo la vista de escena centrada.
- Importación múltiple de objetos en formatos OBJ, STL y MJCF XML, con parámetro de escala de unidades (0.001 para milímetros, 1 para metros).
- Visualización de ángulos articulares y control mediante deslizadores en el panel derecho.
- Conmutación entre grupos de geometría visual y de colisión, y visualización de contactos.
- Reorientación de cámara con arrastre del botón izquierdo del ratón y zoom con la rueda.
- Reinicio del objeto de demostración (botella) con F2 y salida con Esc.
- No incluye tool calling, razonamiento multi-paso, capacidades multilingües de generación ni modos de pensamiento, al no ser un modelo de lenguaje.

## Casos de uso

- Docencia de cinemática de brazos robóticos: el simulador permite mover cada articulación del SO-101 con teclas dedicadas y observar ángulos en tiempo real, lo que facilita explicar grados de libertad y límites articulares sin escribir código.
- Prototipado rápido de escenas de manipulación: la importación multiobjeto de OBJ/STL permite cargar piezas concretas de un proyecto y probar agarres con la pinza antes de trasladar la escena a un pipeline de aprendizaje por refuerzo.
- Validación de modelos MJCF de terceros: al aceptar XML MJCF independientes, se pueden probar modelos de objetos o herramientas aislados y comprobar su geometría de colisión y su comportamiento físico dentro de una escena con robot.
- Demostraciones en ferias o clases: la interfaz con menú en chino y controles por teclado reduce la barrera de entrada para audiencias sin experiencia en Python, permitiendo sesiones guiadas de teleoperación.
- Generación de datos de demostración cualitativos: la teleoperación manual con teclado sirve para grabar trayectorias aproximadas de referencia antes de entrenar políticas con datos más precisos.
- Verificación de escalas y unidades en assets 3D: el parámetro de escala al importar (0.001 frente a 1) ayuda a detectar mallas modeladas en milímetros frente a metros y a corregir escenas mal dimensionadas.
- Configuración de entornos Windows sin permisos de administrador: los scripts `setup.ps1` y `run.ps1` instalan el entorno virtual y la caché de Menagerie dentro del directorio del proyecto, evitando escribir en la unidad C.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no ser un modelo de aprendizaje automático, no aplican métricas como MMLU, HumanEval o GSM8K. Tampoco se proporcionan cifras de latencia de simulación, pasos por segundo ni rendimiento gráfico.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay inferencia de red neuronal. El consumo relevante es de GPU para renderizado 3D y de RAM para la simulación física.
- GPU recomendadas: no se especifican en la documentación. MuJoCo puede renderizar por software o mediante OpenGL; se recomienda una GPU con soporte OpenGL para una vista fluida, pero no hay lista oficial.
- Compatibilidad con GPU de consumo: no disponible como dato verificado; al no requerir VRAM de modelo, cualquier GPU de consumo con drivers OpenGL actualizados debería poder ejecutar el visor, aunque no se confirma en la documentación.
- Opciones de despliegue: ejecución local en Windows mediante PowerShell con `.\scripts\setup.ps1` y `.\scripts\run.ps1`; el entorno `.venv` y la caché de Menagerie se alojan en el directorio del proyecto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Herramienta | Tipo | Interfaz | Robot por defecto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mujoco-cn | Envoltorio de escritorio sobre MuJoCo | Menú en chino, teclado, importación OBJ/STL/MJCF | SO-101 (Menagerie) | Apache-2.0 | HuggingFace y GitHub del autor |
| MuJoCo (oficial) | Motor físico | API Python/C, visor básico | Ninguno | Apache-2.0 | GitHub google-deepmind/mujoco |
| MuJoCo Menagerie | Colección de modelos | Sin interfaz propia | Múltiples (incluye SO-101) | Apache-2.0 | GitHub google-deepmind/mujoco_menagerie |
| Simuladores de robótica con GUI (por ejemplo, CoppeliaSim) | Simulador completo | GUI propietaria | Varios | Propietaria / edición gratuita | Distribución del fabricante |

La comparación es cualitativa porque no hay benchmarks ni métricas de rendimiento publicadas para mujoco-cn. Frente a MuJoCo oficial, mujoco-cn añade ergonomía pero no sustituye la API; frente a Menagerie, aporta una interfaz de ejecución, no modelos nuevos.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural ni tiene pesos entrenados. Cualquier evaluación como modelo fundacional es inaplicable.
- Proyecto comunitario independiente, no es un producto oficial de Google DeepMind; el autor lo declara explícitamente en la model card.
- Plataforma limitada: la guía de inicio rápido está orientada a Windows con PowerShell y Python 3.11 o superior; no se documenta soporte para Linux o macOS.
- Interfaz principal en chino simplificado; el README en inglés existe, pero no se garantiza que toda la UI esté traducida.
- La importación de mallas usa envolvente convexa para colisión, lo que produce colisiones inexactas en objetos cóncavos; la propia documentación recomienda MJCF con geometría de colisión simplificada en esos casos.
- La importación de MJCF está pensada para objetos aislados; no deben importarse escenas completas con suelo o luces, ya que el programa recompila la escena.
- El repositorio en HuggingFace tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB; no hay evidencia de adopción ni de mantenimiento continuado.
- No se especifican sesgos, riesgos de alucinación ni restricciones adicionales de licencia más allá de Apache-2.0; las dependencias MuJoCo y el modelo SO-101 de Menagerie se distribuyen bajo Apache-2.0 y se descargan en tiempo de ejecución.

## Enlaces

- HuggingFace: https://huggingface.co/ywsldxk1/mujoco-cn
- Repositorio GitHub del autor: https://github.com/ywsldxk/mujoco-cn
- MuJoCo (Google DeepMind): https://github.com/google-deepmind/mujoco
- Modelo SO-101 en MuJoCo Menagerie: https://github.com/google-deepmind/mujoco_menagerie/tree/main/robotstudio_so101
- Python: https://www.python.org/
