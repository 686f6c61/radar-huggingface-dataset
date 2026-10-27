# Yashash18/ec-mmseqs-plm-v10

## Resumen

`Yashash18/ec-mmseqs-plm-v10` es un repositorio de Hugging Face (1,7 GB, etiquetas `onnx`, `leak-curber`, `enzyme`, `leaderboard`) creado el 27-10-2026 y asociado a la tarea de clasificación de enzimas del banco de pruebas Leak CURBER. La tarea consiste en recibir un fichero Parquet con las columnas `id` y `sequence` (secuencia de aminoácidos de una enzima) y emitir un fichero JSON Lines con `id` y una lista ordenada de hasta diez números EC, de los cuales solo el primero puntúa. La evaluación mide exactitud top-1 a los niveles EC L1, L2, L3 y L4, y el ranking se ordena por L4.

La model card publicada es, en la práctica, la plantilla de la competición: describe el formato de entrada y salida, el vocabulario EC permitido (ExPASy ENZYME, release 02-Sep-2026, CC BY 4.0), el baseline mayoritario, el entorno de ejecución (CPU, 2 vCPU, 16 GB de RAM, 10 minutos, sin red) y el procedimiento de envío al leaderboard. No contiene, en cambio, descripción de la arquitectura, datos de entrenamiento, licencia ni resultados de evaluación del modelo concreto.

Su relevancia es doble. Por un lado, documenta un protocolo reproducible de anotación funcional de enzimas con restricciones de despliegue realistas (contenedor amd64, sin GPU, sin red, repositorio de 4 GiB como máximo). Por otro, el identificador del repositorio sugiere el uso de MMseqs y de un modelo de lenguaje de proteínas (PLM) en su décima iteración, extremo que no está confirmado en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La etiqueta `onnx` indica exportación a ONNX; el nombre del repositorio sugiere MMseqs + PLM, sin confirmar |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no consta que sea MoE) |
| Longitud de contexto | No disponible. La entrada es una secuencia de aminoácidos de longitud variable, no una ventana de tokens de texto |
| Tipos de cuantizacion | No disponible. Formato de ejecución declarado: ONNX |
| Idiomas soportados | No aplica: la entrada es secuencia proteica, no lenguaje natural |
| Licencia | No disponible |
| Formato de pesos | ONNX (según etiqueta del repositorio); no se detalla el resto de artefactos |
| Tarea | Clasificación enzimática multietiqueta a nivel EC (L1-L4) |
| Metrica de evaluacion | Exactitud top-1 por nivel EC (L4, L3, L2, L1); ranking por L4 |
| Vocabulario de salida | `ec_vocabulary.json`, derivado de ExPASy ENZYME release 02-Sep-2026 |
| Entorno de inferencia | CPU x86-64, 2 vCPU, 16 GB RAM, 10 minutos, sin red |
| Tamano del repositorio | 1,7 GB (límite de la competición: 4 GiB) |
| Fecha de creacion / actualizacion | 27-10-2026 / 27-10-2026 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la model card disponible. El repositorio está etiquetado con `onnx`, lo que indica que el artefacto de inferencia se distribuye en formato ONNX, coherente con el requisito de la competición de ejecutar en CPU sin GPU y sin acceso a red. El nombre `ec-mmseqs-plm-v10` apunta a una combinación de búsqueda o agrupamiento de secuencias con MMseqs (MMseqs2 es una suite de búsqueda y clustering de proteínas y nucleótidos, hasta 10.000 veces más rápida que BLAST según su repositorio) y un modelo de lenguaje de proteínas, pero no hay documentación que confirme ni la arquitectura exacta ni la versión del PLM.

Tampoco hay datos sobre el corpus de entrenamiento (número de secuencias, composición, splits), sobre el vocabulario EC efectivamente cubierto ni sobre el proceso de ajuste. La model card sí describe el protocolo de datos de la competición: `train.parquet` contiene un par entrada-EC por fila con etiqueta `ec_number`, las entradas pueden tener varias EC registradas, las secuencias idénticas se agrupan dentro de cada split conservando el primer `id`, y las etiquetas de validación y los datos de test son privados. La puntuación reparte 1/n cuando una entrada tiene n EC registradas y la primera predicción coincide en los primeros L componentes. No se mencionan RLHF, DPO ni técnicas de decodificación especulativa, que en este dominio no resultan directamente aplicables.

## Capacidades

- Predicción de números EC: emite una lista ordenada de hasta 10 EC distintos, de los cuales solo el primero contribuye a la métrica.
- Evaluación multinivel: la salida se compara a nivel L4 (identificador completo, p. ej. `1.1.1.1`), L3, L2 y L1.
- Gestión de entradas duplicadas: agrupa secuencias idénticas y predice solo para el primer `id` de cada grupo, según el contrato de la competición.
- Salida estructurada JSON Lines con exactamente las claves `id` y `prediction`, sin texto libre.
- Inferencia offline en contenedor: el modelo debe funcionar sin red y sin GPU, con Python en `/usr/local/bin/python` y directorio de trabajo `/app`.
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso, agentes ni planificación.
- No tiene capacidades de visión, audio ni generación de texto en lenguaje natural.
- No se documentan capacidades multilingües (no aplicables al dominio).

## Casos de uso

- Anotación funcional de genomas y metagenomas: dado un catálogo de secuencias proteicas procedentes de un ensamblado, el modelo asigna una EC primaria por proteína y permite priorizar qué candidatas requieren validación experimental, con un coste de ejecución de CPU únicamente.
- Triaje previo a búsqueda por homología: usar la predicción EC como filtro barato antes de lanzar búsquedas MMseqs2 o BLAST contra bases de datos completas, reduciendo el número de secuencias que pasan a la etapa cara del pipeline.
- Curaduría de bases de datos de enzimas: contrastar las anotaciones EC existentes en un repositorio con las predicciones del modelo para detectar entradas obsoletas o mal anotadas, teniendo en cuenta que el vocabulario de referencia es ExPASy ENZYME release 02-Sep-2026.
- Selección de enzimas industriales en biocatálisis: clasificar bibliotecas de variantes o de secuencias ambientales por clase EC (p. ej. hidrolasas, transferasas) para decidir qué candidatas escalar a ensayo enzimático.
- Despliegue en laboratorios con infraestructura limitada: el requisito de 2 vCPU, 16 GB de RAM y ausencia de red permite ejecutar el modelo en estaciones de trabajo modestas o en entornos air-gapped, sin depender de servicios en la nube.
- Docencia y reproducción de benchmarks: el repositorio incluye el flujo completo (`predict.py`, `inputs.py`, Docker) para que un equipo reproduzca el baseline y lo sustituya por su propio modelo en la misma horquilla de recursos.
- Integración en pipelines de control de calidad: ejecutar la inferencia como paso de un pipeline contenerizado que valide que cada predicción pertenece a `ec_vocabulary.json`, sin duplicados y con un máximo de 10 EC por entrada, tal como exige el evaluador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card define el protocolo de evaluación (exactitud top-1 en L4, L3, L2 y L1, ordenación por L4, desempate a favor del envío anterior) y describe un baseline trivial que ignora la entrada y predice la EC más frecuente del conjunto de entrenamiento, pero no incluye cifras de ninguno de los dos. Tampoco se han encontrado resultados del modelo en el leaderboard dentro de la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el evaluador no proporciona GPU y la inferencia es exclusivamente en CPU.
- Memoria RAM: 16 GB asignados por el evaluador; el repositorio ocupa 1,7 GB, por lo que el peso de los artefactos en memoria queda dentro de ese límite.
- CPU: 2 vCPU en arquitectura Linux x86-64 como presupuesto máximo para todos los inputs.
- GPU recomendadas: ninguna. El entorno no expone GPU ni red.
- Compatibilidad con GPU de consumo: irrelevante para este contrato de ejecución; no se documenta un camino de inferencia en GPU.
- Opciones de despliegue: Docker (obligatorio para la competición), con `python /app/predict.py --input INPUT --output OUTPUT`; el runtime de inferencia probablemente usa ONNX Runtime, aunque no se detalla. vLLM, llama.cpp, Ollama y TGI no son aplicables a este tipo de modelo.
- Límites de empaquetado: build de la imagen en menos de 30 minutos, repositorio de 4 GiB o menos y ningún fichero escrito por `predict.py` de más de 16 MiB.
- Latencia y throughput: no disponibles. Solo se conoce el límite duro de 10 minutos para el conjunto completo de entradas; un envío que lo supere se considera fallido.

## Comparativa con modelos similares

No se dispone de especificaciones publicadas de modelos comparables en la información proporcionada (ni parámetros, ni contexto, ni licencia, ni resultados). La comparación se limita a enfoques metodológicamente afines, con los datos disponibles marcados como no disponibles.

| Enfoque | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Yashash18/ec-mmseqs-plm-v10` | No disponible | Secuencia de aminoácidos; longitud no especificada | No publicado | No disponible | Repositorio público en HF, 1,7 GB |
| Baseline mayoritario (starter del leaderboard) | Ninguno (tabla de frecuencias) | Ignora la secuencia | No publicado | No disponible | Público (`starkAhmed43/leak-curber-enzyme-classification-starter`) |
| MMseqs2 (búsqueda por homología) | No aplica (software) | Secuencias de proteínas y nucleótidos | No disponible en la información aportada | No disponible en la información aportada | Código abierto en GitHub |
| PLMSearch (PLM + similitud estructural) | No disponible | Secuencias de proteínas | Resultados publicados en Nature Communications 2024 (no reproducidos aquí) | No disponible | Paper y código asociados |

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial ni redistribución de los pesos sin autorización explícita del autor.
- Ausencia total de documentación sobre arquitectura, datos de entrenamiento y procedencia de las secuencias, lo que impide auditar sesgos o fuga de datos entre entrenamiento y evaluación.
- El banco de pruebas se denomina Leak CURBER y el protocolo agrupa secuencias idénticas por split; conviene verificar que el modelo no se ha entrenado con secuencias presentes en validación o test.
- El vocabulario de salida está cerrado a `ec_vocabulary.json` (ExPASy ENZYME, 02-Sep-2026). Cualquier EC fuera de esa lista invalida la predicción.
- Solo la primera EC de la lista puntúa: añadir candidatos adicionales no mejora la métrica y aumenta el riesgo de duplicados o de EC inválidas.
- Riesgo de alucinación en sentido estricto no aplica; el fallo típico es la asignación de una EC incorrecta o demasiado genérica, especialmente en clases poco representadas.
- Rendimiento decreciente esperable en secuencias largas, atípicas o de baja similitud con las familias representadas en el conjunto de entrenamiento (no cuantificado).
- Trazabilidad y reproducibilidad limitadas: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- En producción, el modelo debe respetar el contrato del evaluador: exactamente las claves `id` y `prediction`, una entrada por `id` único, sin líneas en blanco, sin duplicados y sin acceso a red.
- Metadatos con fechas de 2026: conviene comprobar la vigencia del repositorio y del vocabulario EC antes de integrarlo en un sistema real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yashash18/ec-mmseqs-plm-v10
- Repositorio starter de la tarea: https://huggingface.co/starkAhmed43/leak-curber-enzyme-classification-starter
- Dataset de la tarea: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-classification
- Leaderboard (Space): https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignación de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
- ExPASy ENZYME (vocabulario EC, CC BY 4.0): https://enzyme.expasy.org/
- MMseqs2 (búsqueda y clustering de secuencias): https://github.com/soedinglab/MMseqs2
- PLMSearch (PLM para similitud estructural): https://www.nature.com/articles/s41467-024-46808-5
- AlphaFast (búsqueda de alto rendimiento sobre MMseqs): https://github.com/RomeroLab/alphafast
