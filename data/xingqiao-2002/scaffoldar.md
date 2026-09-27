# Xingqiao-2002/ScaffoldAR

## Resumen

ScaffoldAR es un checkpoint de un modelo generativo jerárquico basado en difusion para la generacion de conformaciones de polimeros. Lo publica el usuario Xingqiao-2002 en HuggingFace, con codigo asociado en el repositorio GitHub `XingqiaoLin/poly`, dentro de la carpeta `scaffoldar/`. El modelo no es un modelo de lenguaje: es una herramienta de quimica computacional que produce geometrias 3D plausibles de cadenas polimericas completas, un problema relevante en el diseno de materiales, la simulacion molecular y el cribado de nuevos polimeros, donde generar estructuras de partida realistas sigue siendo costoso.

A diferencia de las difusiones planas sobre coordenadas atomicas, ScaffoldAR descompone la generacion en tres niveles acoplados: una difusion de escala de cadena (longitud media de segmento), una difusion de trayectoria global condicionada por esa escala y una difusion local sobre el toro / SO(3) para cada unidad repetida. El paquete distribuye el modelo completo en un unico fichero `scaffoldar.pt` de aproximadamente 0,6 GB de repositorio, junto con los argumentos de entrenamiento y el sampler por defecto seleccionado sobre un benchmark de validacion.

La ficha publica es minima: no se declaran parametros, contexto, idiomas ni resultados de benchmarks. Esto limita cualquier evaluacion cuantitativa previa a la descarga y obliga a inspeccionar el checkpoint y el codigo fuente para obtener detalles de arquitectura y coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion generativa jerarquica de tres etapas: `scale_diffusion` (escala de cadena, longitud media de segmento), `path_diffusion` (difusion de trayectoria global condicionada por escala), `local_diffusion` (difusion local en toro / SO(3) por unidad repetida) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo generativo de conformaciones 3D, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (se distribuye un unico checkpoint en coma flotante, sin variantes cuantizadas declaradas) |
| Idiomas soportados | no aplica (modelo de dominio cientifico, no linguístico) |
| Licencia | GPL-3.0 |
| Formato de pesos | PyTorch, fichero unico `scaffoldar.pt` |
| Tamano del repositorio | 0,6 GB |
| Ficheros auxiliares | logs de entrenamiento `*.metrics.jsonl` y argumentos de entrenamiento por submodelo |
| Descargas / likes | 0 / 0 |
| Fecha de creacion registrada | 2026-09-27 |
| Ultima actualizacion registrada | 2026-09-27 |

## Arquitectura y entrenamiento

El modelo se organiza como una difusion jerarquica en tres bloques que se ejecutan en cascada. En primer lugar, `scale_diffusion` modela la escala global de la cadena a traves de la longitud media de segmento. En segundo lugar, `path_diffusion` genera una trayectoria global condicionada por la escala producida en la etapa anterior. Por ultimo, `local_diffusion` refina cada unidad repetida mediante una difusion local definida sobre el toro y el grupo SO(3), adecuada para representar angulos diedros y orientaciones. Cada entrada del checkpoint almacena sus pesos (`model`) y sus argumentos de entrenamiento (`args`), y el bloque `sampler` contiene la configuracion de muestreo por defecto, seleccionada sobre el benchmark de validacion.

Todos los submodelos se entregan en un unico fichero `scaffoldar.pt`, lo que simplifica el despliegue pero impide saber, a partir de la informacion publicada, el numero de parametros de cada red, la funcion de perdida exacta, el volumen de datos de entrenamiento, la composicion del dataset de polimeros ni si hubo etapas de ajuste fino posteriores. Tampoco se detalla si el muestreo emplea pasos de decodificacion acelerada, guiado por clasificador u otra tecnica de aceleracion. Los logs `*.metrics.jsonl` incluidos en el repositorio son la unica fuente primaria de informacion sobre el proceso de entrenamiento, pero su contenido no se reproduce en la model card.

## Capacidades

- Generacion de conformaciones 3D completas de cadenas polimericas mediante muestreo por difusion.
- Generacion jerarquica en tres escalas: escala de cadena, trayectoria global y geometria local por unidad repetida.
- Control de la escala de la cadena a traves de la etapa `scale_diffusion` (longitud media de segmento).
- Condicionamiento de la trayectoria global por la escala generada, lo que permite coherencia entre las escalas gruesa y fina.
- Modelado de grados de libertad locales (toro y SO(3)) para orientaciones y angulos de las unidades repetidas.
- Ejecucion en paralelo sobre varias GPU, segun el script de generacion de ejemplo que usa cuatro dispositivos (`GPUS="0 1 2 3"`).
- Reproducibilidad del muestreo mediante el bloque `sampler` con ajustes por defecto validados.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni razonamiento multi-paso en agentes: la informacion disponible no describe ninguna de estas capacidades y el dominio del modelo es exclusivamente geometrico-molecular.
- Capacidades multilingues: no aplica.

## Casos de uso

- Generacion de estructuras de partida para dinamica molecular: producir conformaciones iniciales plausibles de un polimero antes de lanzar una simulacion atomistica, reduciendo el tiempo dedicado a equilibrado y minimizacion.
- Cribado virtual de materiales polimericos: generar conjuntos de conformaciones para estimar propiedades dependientes de la geometria (radio de giro, rigidez de cadena) sobre muchos candidatos antes de sintetizar nada.
- Aumento de datos para otros modelos: usar las conformaciones generadas como datos sinteticos para entrenar o preentrenar predictores de propiedades de polimeros cuando el dataset experimental es escaso.
- Analisis de distribucion conformacional: muestrear multiples conformaciones del mismo sistema para estudiar variabilidad estructural, degeneracion y paisajes de energia aproximados.
- Estudio de efectos de escala de cadena: gracias a la etapa `scale_diffusion`, generar cadenas condicionadas a una longitud media de segmento objetivo y comparar el impacto de la escala en la geometria resultante.
- Validacion y benchmarking interno de metodos generativos: el propio checkpoint incluye un `sampler` ajustado sobre un benchmark de validacion, por lo que sirve como linea base frente a otras aproximaciones de generacion de conformaciones.
- Integracion en pipelines HPC de generacion masiva: el script de ejemplo reparte el trabajo en cuatro GPU, lo que permite encajar el modelo en colas de computo cientifico para generar lotes grandes de conformaciones.
- Prototipado en investigacion academica: al estar liberado bajo GPL-3.0 y con el codigo disponible, es utilizable como punto de partida para reproducir resultados o extender la jerarquia de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un "validation benchmark" empleado para seleccionar la configuracion del sampler, pero no reproduce ninguna metrica, ni valores numericos, ni comparaciones con otros metodos.

## Requisitos de hardware

- El repositorio ocupa 0,6 GB y el modelo se distribuye en un unico fichero `scaffoldar.pt`; el tamano en VRAM depende del numero de parametros de los tres submodelos, dato no disponible.
- El script de generacion de ejemplo del autor usa cuatro GPU (`GPUS="0 1 2 3"`), lo que indica soporte multi-GPU, aunque no se especifica si la generacion funciona en una sola GPU.
- GPU concretas recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible, no se puede estimar sin conocer el numero de parametros ni la precision de los pesos.
- Opciones de despliegue: no se declaran integraciones con vLLM, llama.cpp, Ollama ni TGI; el modelo se ejecuta con el codigo propio del repositorio `XingqiaoLin/poly` (carpeta `scaffoldar/`), descargando el checkpoint a `scaffoldar/checkpoints/`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos de generacion de conformaciones de polimeros con los que comparar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ficha de modelo muy escasa: no se publican parametros, datos de entrenamiento, metricas ni limitaciones conocidas, lo que dificulta evaluar su calidad antes de la descarga.
- Riesgo de alucinacion en sentido geometrico: al ser un modelo generativo, puede producir conformaciones fisicamente inverables o con solapamientos estericos, por lo que requiere validacion con herramientas de mecanica molecular antes de cualquier uso cientifico serio.
- Dominio restringido: no es un modelo de lenguaje ni un modelo multimodal; no procesa texto, imagenes, audio ni instrucciones en lenguaje natural.
- Sin informacion sobre sesgos de dominio: se desconoce la cobertura quimica del dataset de entrenamiento (familias de polimeros, tacticidad, grupos funcionales) y, por tanto, el riesgo de generalizacion deficiente fuera de esa distribucion.
- Licencia GPL-3.0: es una licencia copyleft fuerte. Cualquier obra derivada distribuida debe publicarse bajo la misma licencia, lo que puede ser incompatible con productos propietarios o con pipelines corporativos cerrados. Conviene revisar el cumplimiento antes de integrarlo en produccion.
- Sin garantias declaradas: el repositorio no incluye informacion sobre mantenimiento, versionado ni soporte.
- Fechas de creacion y actualizacion registradas como 2026-09-27, sin historial posterior de revisiones.
- Estado de adopcion nulo (0 descargas, 0 likes), por lo que no existe comunidad que haya validado el checkpoint de forma independiente.
- No se puede estimar el coste de inferencia real ni el cumplimiento de requisitos de memoria por GPU con la informacion publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Xingqiao-2002/ScaffoldAR
- Codigo fuente: https://github.com/XingqiaoLin/poly (carpeta `scaffoldar/`)
- Fichero de pesos: `scaffoldar.pt` en el repositorio de HuggingFace
- Logs de entrenamiento: ficheros `*.metrics.jsonl` incluidos en el repositorio
- Paper, blog o demo: no disponible
