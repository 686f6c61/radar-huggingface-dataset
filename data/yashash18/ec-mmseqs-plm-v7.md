# Yashash18/ec-mmseqs-plm-v7

## Resumen

Yashash18/ec-mmseqs-plm-v7 es un modelo publicado en Hugging Face para la tarea de clasificación de enzimas por número EC (Enzyme Commission), dentro de la competición Leak CURBER. El repositorio ocupa 1,8 GB y está etiquetado con el tag `onnx`, lo que indica que el artefacto de inferencia se distribuye en formato ONNX y está pensado para ejecutarse en CPU. No se ha publicado información sobre el autor más allá del identificador de usuario.

El modelo recibe un fichero Parquet con las columnas `id` y `sequence` (secuencia de aminoácidos de la enzima) y devuelve un fichero JSON Lines con `id` y `prediction`, donde la predicción es una lista ordenada de hasta 10 códigos EC distintos. La puntuación se calcula como top-1 accuracy en los niveles L4, L3, L2 y L1 del código EC, y el ranking se ordena por L4.

La relevancia actual del modelo es acotada y muy específica: no es un modelo de propósito general, sino una entrega de competición sujeta a un entorno de evaluación muy restringido (2 vCPU, 16 GB de RAM, 10 minutos, sin GPU y sin red). La model card pública no describe la arquitectura, el entrenamiento ni los resultados del modelo; el contenido del README es la plantilla genérica de la tarea, no una ficha técnica del artefacto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `onnx` sugiere exportación a ONNX; el nombre del repo apunta a una combinación de MMseqs y un protein language model, sin confirmación documental) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible; la entrada es una secuencia de aminoácidos, no texto en lenguaje natural |
| Licencia | no disponible |
| Formato de pesos | ONNX (según el tag `onnx`); el repositorio contiene 1,8 GB de artefactos |
| Tarea | clasificación de enzimas en códigos EC (top-1 sobre hasta 10 predicciones ordenadas) |
| Entrada | Parquet con columnas `id` y `sequence` |
| Salida | JSON Lines con claves `id` y `prediction` (lista de ECs distintos, el mejor primero) |
| Métrica de evaluación | top-1 accuracy en niveles EC L4, L3, L2 y L1; ranking por L4 |
| Entorno de ejecución exigido | Linux x86-64, CPU, 2 vCPU, 16 GB RAM, 10 minutos, sin red |
| Tamaño del repositorio | 1,8 GB (límite de la competición: 4 GiB) |
| Fecha de creación | 2026-10-26 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura, el número de parámetros, la composición del dataset de entrenamiento ni el procedimiento de ajuste (RLHF, DPO u otros). El único indicio técnico disponible es doble: el tag `onnx` indica que el artefacto se exporta a ONNX para inferencia en CPU, y el nombre del repositorio (`ec-mmseqs-plm-v7`) sugiere el uso combinado de búsqueda de secuencias tipo MMseqs con un modelo de lenguaje de proteínas, en su séptima iteración. Ninguna de estas dos inferencias está confirmada por documentación del autor.

El contexto de la tarea sí está bien definido: los datos públicos son `train.parquet` (con la etiqueta `ec_number`) y `val_inputs.parquet` (solo entradas); las etiquetas de validación y los datos de test son privados. El vocabulario permitido de códigos EC proviene de ExPASy ENZYME, release 02-Sep-2026, publicado por SIB bajo CC BY 4.0. El baseline oficial ignora la entrada y predice el EC más frecuente del conjunto de entrenamiento, por lo que cualquier modelo presentado debe superar ese listón trivial.

## Capacidades

- Clasificación de enzimas: asigna uno o varios códigos EC a una secuencia de aminoácidos, con hasta 10 predicciones ordenadas por confianza.
- Predicción jerárquica: la salida se evalúa de forma parcial en los niveles L1 a L4 del código EC, de modo que el modelo puede obtener crédito por coincidencias en los componentes superiores.
- Ejecución en CPU sin red: la inferencia está diseñada para funcionar con 2 vCPU y 16 GB de RAM, sin GPU y sin acceso a red.
- Formato de integración: lectura de Parquet y escritura de JSON Lines, adecuado para pipelines por lotes.
- Manejo de entradas duplicadas: el protocolo agrupa secuencias idénticas y puntúa cada entrada única una sola vez; el modelo debe predecir únicamente el primer identificador de cada grupo.
- No se han documentado capacidades de tool calling, razonamiento multi-paso, agentes, visión, audio ni generación de texto libre.

## Casos de uso

- Anotación funcional de genomas recién secuenciados: dada una lista de proteínas candidatas en un Parquet, el modelo devuelve un código EC por secuencia para priorizar dianas enzimáticas antes de la validación experimental.
- Cribado metagenómico: procesar por lotes miles de secuencias ambientales en un servidor sin GPU para asignar funciones enzimáticas preliminares y filtrar las que requieren análisis manual.
- Curaduría de bases de datos biológicas: usar el top-5/top-10 de ECs como sugerencias para revisores humanos, con el nivel L1 como clasificación gruesa fiable y el L4 como propuesta a verificar.
- Bioprospección industrial: identificar hidrolasas, oxidorreductasas o transferasas potenciales en librerías de secuencias antes de pasar a ensayos de actividad.
- Participación en la competición Leak CURBER: el repositorio es una entrega lista para el leaderboard, con `Dockerfile`, `predict.py` y `README.md` como artefactos mínimos exigidos.
- Baseline interno de comparación: al ser un modelo pequeño en CPU con salida EC jerárquica, sirve como referencia para medir la mejora de modelos proteicos de mayor tamaño en la misma tarea.
- Docencia y prototipado: el flujo completo (Parquet de entrada, JSONL de salida, Docker sin red) permite montar un ejercicio reproducible de clasificación enzimática sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el protocolo de evaluación, pero no incluye puntuaciones del modelo en validación ni en test.

Protocolo de puntuación descrito:

| Aspecto | Detalle |
|---|---|
| Métrica principal | top-1 accuracy a nivel EC L4 |
| Métricas reportadas | L4, L3, L2 y L1 |
| Crédito parcial | si una entrada tiene n ECs registrados, la primera predicción obtiene 1/n por cada EC registrado cuyos primeros L componentes coincidan |
| Límite de predicciones | hasta 10 ECs, solo la primera cuenta para la puntuación |
| Predicción vacía | puntuación cero |
| Baseline | EC más frecuente del conjunto de entrenamiento, ignorando la entrada |
| Desempate | misma puntuación favorece el envío anterior |

## Requisitos de hardware

- VRAM: no aplica; el evaluador no proporciona GPU y el modelo está etiquetado como ONNX para ejecución en CPU.
- Entorno de evaluación: Linux x86-64, 2 vCPU, 16 GB de RAM, sin red, con un límite de 10 minutos para procesar todas las entradas de validación.
- GPU recomendadas: ninguna. Si se quisiera reutilizar el artefacto ONNX en GPU, no hay información publicada sobre proveedores (CUDA, TensorRT, ROCm) ni sobre rendimiento.
- Compatibilidad con GPU de consumo: no disponible; el diseño declarado es CPU-only.
- Opciones de despliegue: ONNX Runtime es la vía coherente con el tag del repositorio; también es posible empaquetar en Docker siguiendo el `Dockerfile` del repo. vLLM, llama.cpp, Ollama y TGI no aplican a este tipo de modelo.
- Límites de empaquetado: la imagen debe construirse en menos de 30 minutos, el repositorio no puede superar 4 GiB (el actual ocupa 1,8 GB) y ningún fichero escrito por `predict.py` puede exceder 16 MiB.
- Latencia y throughput: no disponibles; el único dato objetivo es el presupuesto de 10 minutos para el conjunto completo de entradas de validación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yashash18/ec-mmseqs-plm-v7 | no disponible | no disponible | clasificación EC con artefacto ONNX para CPU; posible combinación MMseqs + PLM (no confirmado) | no disponible | Hugging Face, público |
| ESM-2 (650M) | 650M | 1.024 tokens de secuencia | protein language model de propósito general, requiere cabeza de clasificación para EC | MIT (según publicación de Meta) | pública |
| ProtBert-BFD | ~420M | 512 tokens de secuencia | protein language model BERT sobre UniRef100 | MIT/Apache según variante (verificar) | pública |
| Baseline mayoritario de Leak CURBER | 0 (tabla de frecuencias) | no aplica | predice el EC más frecuente del train | no disponible | incluido en el starter de la competición |

Advertencia: los datos de ESM-2 y ProtBert son referencias públicas generales y no han sido verificados en la información proporcionada; no hay métricas comparables de este modelo en la misma tarea, por lo que la comparación es únicamente categórica.

## Limitaciones y advertencias

- La model card no documenta arquitectura, parámetros, datos de entrenamiento ni licencia; no es posible evaluar el modelo en profundidad ni verificar su procedencia.
- Ausencia total de benchmarks publicados: no hay evidencia de que el modelo supere al baseline mayoritario descrito en la propia competición.
- Licencia no disponible: no se puede asumir uso comercial. Cualquier despliegue en producción requiere contactar con el autor.
- Riesgo de sobreajuste al vocabulario EC de la release 02-Sep-2026 de ExPASy ENZYME; códigos nuevos o reclasificados fuera de `ec_vocabulary.json` no serán admitidos por el evaluador.
- La predicción se limita a códigos EC existentes en el vocabulario; una predicción con un EC fuera de la lista invalida la evaluación completa.
- Solo la primera predicción puntúa en la métrica top-1 de L4, aunque se permitan hasta 10 ECs; el resto no mejora la puntuación.
- No se debe normalizar ni modificar las secuencias de entrada, según las instrucciones de la tarea; alterar la secuencia puede romper el agrupamiento de entradas duplicadas.
- El entorno de evaluación es estrictamente offline y con 10 minutos de presupuesto: cualquier dependencia de red, modelo auxiliar pesado o base de datos externa hace fallar el envío.
- El límite de 16 MiB por fichero escrito por `predict.py` puede entrar en conflicto con la obligación de escribir una línea por cada identificador único en conjuntos de validación grandes; conviene verificar el tamaño antes de enviar.
- La puntuación en test no es reproducible públicamente: las etiquetas de validación y los datos de test son privados, por lo que el rendimiento reportado no es auditable de forma independiente.
- El repositorio tiene 0 descargas y 0 likes, creado y actualizado el mismo día: no hay evidencia de uso ni de revisión por terceros.
- El tag `leak-curber` hace referencia al nombre del benchmark; no implica ninguna garantía sobre la ausencia de fuga de datos entre entrenamiento y evaluación en este modelo concreto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yashash18/ec-mmseqs-plm-v7
- Repositorio starter de la tarea: https://huggingface.co/starkAhmed43/leak-curber-enzyme-classification-starter
- Dataset de la competición: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-classification
- Leaderboard (Space): https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignación de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
- Vocabulario EC de referencia (ExPASy ENZYME, CC BY 4.0): https://enzyme.expasy.org/
