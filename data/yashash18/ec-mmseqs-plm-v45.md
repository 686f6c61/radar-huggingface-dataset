# Yashash18/ec-mmseqs-plm-v45

## Resumen

`Yashash18/ec-mmseqs-plm-v45` es un modelo publicado en Hugging Face por el usuario Yashash18, etiquetado como participante en la competición Leak CURBER de clasificación de enzimas. Se distribuye como un artefacto ONNX de aproximadamente 2,5 GB, lo que sugiere un modelo de lenguaje de proteínas (protein language model, PLM) preentrenado sobre secuencias de la base de datos MMseqs, adaptado a la tarea de asignación de números EC (Enzyme Commission). El nombre del repositorio indica un modelo de la familia de embeddings proteicos orientado a la clasificación enzimática jerárquica.

La tarea asociada consiste en recibir secuencias de aminoácidos y predecir el número EC correspondiente, evaluándose con precisión top-1 a cuatro niveles jerárquicos (L1 a L4), con ranking por L4. El modelo se ejecuta exclusivamente en CPU, con un límite de 2 vCPU, 16 GB de RAM y 15 minutos para todo el conjunto de evaluación, sin acceso a red. Estas restricciones condicionan fuertemente el diseño y el despliegue del modelo.

La información pública disponible es muy limitada: la model card del repositorio no describe la arquitectura, los datos de entrenamiento ni los resultados, y el repositorio no registra descargas ni interacciones. Esta ficha se limita, por tanto, a los datos verificables del artefacto y del contexto de la competición, marcando explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto en formato ONNX; el nombre sugiere un protein language model) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (entrada: secuencias de aminoácidos) |
| Licencia | no disponible |
| Formato de pesos | ONNX |
| Tamaño del repositorio | 2,5 GB |
| Tarea | Clasificación de enzimas (predicción de número EC) |
| Entorno de inferencia | CPU, 2 vCPU, 16 GB RAM, 15 minutos, sin red |
| Etiquetas | onnx, leak-curber, enzyme, leaderboard, region:us |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. El artefacto se distribuye en formato ONNX, lo que indica que el autor ha exportado el grafo para inferencia portable, presumiblemente con el objetivo de cumplir los requisitos de la competición Leak CURBER (ejecución en CPU sin GPU y sin red). El nombre `ec-mmseqs-plm-v45` sugiere un protein language model preentrenado sobre secuencias de MMseqs (probablemente el corpus UniRef o similar generado con MMseqs2) y afinado para clasificación de números EC, en su versión 45.

Tampoco se detallan los datos de entrenamiento, el número de tokens procesados, la composición del corpus, ni si se aplicaron técnicas de ajuste como RLHF, DPO o fine-tuning supervisado específico. La model card del repositorio corresponde a la plantilla genérica de la competición y no incluye descripción técnica del modelo. Cualquier afirmación sobre innovaciones arquitectónicas (atención lineal, decodificación especulativa, etc.) sería especulativa y no se incluye.

## Capacidades

- Predicción de números EC (Enzyme Commission) a partir de secuencias de aminoácidos, con salida en formato JSON Lines con los campos `id` y `prediction`.
- Salida de hasta 10 predicciones EC distintas ordenadas por confianza, aunque solo la primera cuenta para la métrica.
- Clasificación jerárquica evaluable a niveles L1, L2, L3 y L4 (siendo L4 el criterio de ranking).
- Procesamiento por lotes de ficheros Parquet con columnas `id` y `sequence`.
- Ejecución en CPU sin GPU y sin acceso a red, conforme a las restricciones de la competición.
- Capacidad de generar predicciones vacías (puntuación cero) o múltiples candidatos según la estrategia del autor.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Anotación funcional de genomas y metagenomas: el modelo puede asignar números EC a proteínas anotadas como enzimas en pipelines de anotación, sustituyendo o complementando búsquedas BLAST o HMMER con una inferencia neuronal rápida en CPU.
- Curación de bases de datos enzimáticas: integrado en flujos de revisión de entradas de bases como ExPASy ENZYME o BRENDA, permite priorizar secuencias con asignaciones EC dudosas para revisión manual.
- Descubrimiento de enzimas en datos ambientales: aplicable a secuencias metagenómicas sin homología clara, donde los métodos basados en alineamiento fallan y un PLM puede capturar señales funcionales latentes.
- Clasificación a gran escala en entornos sin GPU: al ejecutarse en CPU con 16 GB de RAM y 15 minutos por lote, encaja en infraestructura de laboratorio modesto o en contenedores serverless con límites estrictos.
- Participación en competiciones y benchmarking: sirve como punto de partida o referencia para equipos que abordan la tarea Leak CURBER de clasificación enzimática.
- Docencia e investigación en bioinformática: útil como ejemplo práctico de despliegue de modelos ONNX para tareas biológicas con restricciones de cómputo realistas.
- Filtrado previo en pipelines de ingeniería de proteínas: permite descartar o priorizar candidatos enzimáticos antes de validación experimental costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de validación ni de test, y el repositorio no registra puntuaciones en el leaderboard de Leak CURBER.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para inferencia en CPU.
- GPU recomendadas: no aplica; la competición prohíbe GPU en la evaluación.
- CPU y memoria de evaluación: 2 vCPU y 16 GB de RAM, con un límite de 15 minutos para todo el conjunto de entradas.
- Almacenamiento: el repositorio ocupa 2,5 GB; el límite de la competición es de 4 GiB por repositorio.
- Cabe en hardware de consumo: sí, siempre que se disponga de al menos 16 GB de RAM y CPU x86-64.
- Opciones de despliegue: ONNX Runtime es la vía natural dado el formato de pesos; también podría ejecutarse mediante contenedores Docker con Python en `/usr/local/bin/python` y directorio de trabajo `/app`, según los requisitos de la competición.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos verificables de parámetros, contexto o rendimiento. Como referencia contextual, la competición Leak CURBER emplea un baseline trivial que predice el EC más frecuente del conjunto de entrenamiento, pero no se dispone de sus métricas ni de las de otros participantes.

## Limitaciones y advertencias

- Información técnica ausente: no se documentan arquitectura, parámetros, datos de entrenamiento ni licencia, lo que impide evaluar su idoneidad para producción.
- Licencia no especificada: sin licencia explícita, el uso comercial es jurídicamente incierto y debe consultarse con el autor.
- Riesgo de alucinación y falsos positivos: como clasificador, puede asignar números EC plausibles pero incorrectos, especialmente en secuencias sin homología conocida o en familias enzimáticas poco representadas.
- Sesgo de datos: si el preentrenamiento se basa en MMseqs/UniRef, heredará los sesgos de sobrerrepresentación de organismos modelo y enzimas bien estudiadas.
- Restricciones de evaluación: el modelo está pensado para CPU, 2 vCPU, 16 GB de RAM y 15 minutos; su uso fuera de ese entorno puede requerir ajustes de rendimiento.
- Formato de salida rígido: debe producir JSON Lines con exactamente las claves `id` y `prediction`, sin duplicados ni ECs fuera del vocabulario permitido, o la evaluación falla.
- Sin soporte documentado de texto, código, visión ni agentes: su ámbito es exclusivamente la clasificación de secuencias proteicas.
- Repositorio sin adopción: cero descargas y cero likes en el momento de la consulta, lo que reduce la validación comunitaria disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yashash18/ec-mmseqs-plm-v45
- Leaderboard de Leak CURBER: https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Repositorio de datos de la competición: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-classification
- Modelo starter de la competición: https://huggingface.co/starkAhmed43/leak-curber-enzyme-classification-starter
- Hoja de asignación de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
- ExPASy ENZYME (vocabulario EC, CC BY 4.0): https://enzyme.expasy.org/
