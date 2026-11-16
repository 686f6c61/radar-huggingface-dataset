# youmans/espaloma-onnx

## Resumen

Espaloma-onnx es una conversión a formato ONNX del modelo de asignación de parámetros de campo de fuerzas Espaloma 0.3.2, publicada por el usuario youmans en Hugging Face. El modelo original Espaloma, desarrollado en el ecosistema Open Force Field (OpenFF), predice cargas parciales y parámetros de interacción enlazada (enlaces, ángulos, torsiones) a partir de la estructura molecular, sustituyendo el ajuste manual de parámetros por un enfoque basado en grafos neuronales. Esta conversión permite ejecutar la inferencia en CPU mediante ONNX Runtime, eliminando la dependencia de DGL y de aceleradores GPU para el despliegue.

El repositorio incluye únicamente los pesos convertidos (tamaño de repo 0,0 GB según los metadatos disponibles) y una interfaz de Python distribuida aparte (`espaloma-onnx`) que acepta SMILES como entrada. El modelo no es un modelo de lenguaje: es una herramienta de química computacional orientada a flujos de mecánica molecular, por lo que sus "capacidades" se limitan a la parametrización de moléculas, no a generación de texto ni razonamiento.

La relevancia de esta conversión radica en que reduce la latencia y simplifica el despliegue en entornos sin GPU, con una validación numérica frente a la implementación original en DGL (116 de 118 tests superados y una diferencia absoluta máxima de aproximadamente 1,91e-6). Es, por tanto, un artefacto de infraestructura para pipelines de dinámica molecular más que un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de mensajes sobre grafos moleculares (Espaloma 0.3.2), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesa una molécula por petición, con recuentos de átomos e interacciones dinámicos) |
| Tipos de cuantizacion | FP32 (única precisión documentada) |
| Idiomas soportados | en (documentación e interfaz en inglés) |
| Licencia | MIT |
| Formato de pesos | ONNX (ejecutable con ONNX Runtime) |

## Arquitectura y entrenamiento

El modelo subyacente es Espaloma 0.3.2, un modelo de mecánica molecular basado en grafos neuronales que asigna parámetros de campo de fuerzas (cargas parciales y coeficientes enlazados) directamente desde la topología molecular. La conversión preserva el grafo computacional en ONNX y expone siete arrays de entrada con recuentos dinámicos de átomos e interacciones, generados por un paso de preprocesamiento (`prepare`) que añade hidrógenos explícitos, aplica aromaticidad MDL y replica el preprocesamiento de OpenFF/RDKit, incluyendo la eliminación de información isotópica en el round-trip.

La validación reportada compara las salidas ONNX con la implementación original en DGL: coincidencia de los siete arrays de entrada en los casos correctos, tolerancias rtol=1e-4 y atol=1e-5, y diferencia absoluta máxima de aproximadamente 1,91e-6. De 118 tests, 116 pasan y dos casos de H2 fallan por un bug de forma de array de ángulos vacío en la construcción original del grafo. Los detalles de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada, ya que se trata de una conversión de un checkpoint preexistente y no de un entrenamiento nuevo.

## Capacidades

- Predicción de cargas parciales por átomo (`n1_q`, en unidades de carga elemental).
- Predicción de coeficientes y distancias de equilibrio de enlace (`n2_k`, `n2_eq`).
- Predicción de coeficientes y valores de equilibrio de ángulo (`n3_k`, `n3_eq`).
- Predicción de coeficientes de torsión propia (`n4_k`, seis componentes por torsión).
- Predicción de coeficientes de torsión impropia (`n4_improper_k`).
- Intermedios de equilibración de carga (`n1_s`, `n1_e`), no interpretables como observables independientes.
- Entrada mediante SMILES con un único molécula por petición y recuentos dinámicos de átomos e interacciones.
- Inferencia en CPU con ONNX Runtime (CPUExecutionProvider), sin dependencia de GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Parametrización automática de moléculas en pipelines de dinámica molecular: dado un SMILES, el modelo genera cargas y parámetros enlazados que pueden convertirse en un sistema OpenMM, sustituyendo el ajuste manual de parámetros por inferencia neuronal.
- Cribado virtual de bibliotecas de compuestos: al procesar una molécula en milisegundos en CPU, permite parametrizar grandes conjuntos de SMILES de forma secuencial en un solo servidor sin GPU.
- Integración en flujos de quimioinformática con RDKit: la interfaz acepta SMILES y usa RDKit para preprocesamiento, encajando en scripts existentes de preparación de estructuras.
- Despliegue en entornos de computación de bajo coste o contenedores sin GPU: la conversión ONNX con CPUExecutionProvider elimina la necesidad de DGL y de hardware acelerado.
- Validación cruzada de implementaciones: las tolerancias documentadas (rtol=1e-4, atol=1e-5) permiten usar el modelo como referencia numérica frente a la implementación original en DGL.
- Servicio de parametrización bajo demanda: con un Predictor residente, las peticiones SMILES posteriores a la inicial tienen latencias de milisegundos (3,0 ms medianos en el caso reportado), adecuadas para APIs de química computacional.
- Pruebas de regresión en CI/CD de química: los tests portables del repositorio de GitHub permiten verificar que la conversión ONNX sigue coincidiendo con el checkpoint original tras cambios de dependencias.

## Benchmarks y rendimiento

Rendimiento en CPU reportado por el autor (Ryzen 9 9950X3D, FP32, CPUExecutionProvider, 10 calentamientos y 100 peticiones secuenciales, una sesión residente):

| Molecula | Hilos | ONNX mediana / P95 (ms) | DGL misma ejecucion mediana / P95 (ms) |
|---|---:|---:|---:|
| Cafeina | 8 | 2,69 / 3,47 | 6,81 / 8,24 |
| Ciclosporina A (196 atomos con H) | 8 | 11,81 / 15,75 | 23,61 / 26,86 |
| Ciclosporina A | 16 | 12,50 / 13,41 | 21,15 / 25,32 |

Latencia de la API de usuario y arranque de proceso (Ryzen 9 9950X3D, 8 hilos, ficheros locales):

| Operacion | Cafeina mediana / P95 (ms) | Ciclosporina A mediana / P95 (ms) |
|---|---:|---:|
| Arrancar proceso Python y recibir el primer resultado | 140,23 / 209,98 | 155,20 / 157,14 |
| Inicializar Predictor (import, verificacion de ficheros, creacion de sesion) | 47,87 / 56,10 | 47,02 / 48,41 |
| Primera peticion SMILES tras inicializar | 6,57 / 7,33 | 21,66 / 24,18 |
| Peticiones SMILES posteriores con Predictor residente | 3,0 (mediana; P95 no disponible en el extracto) | no disponible |

No se han publicado resultados de benchmarks de precisión química (energías o fuerzas) en la información disponible; la validación reportada es de consistencia numérica frente a DGL, no de exactitud fisicoquímica.

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia se ejecuta en CPU con ONNX Runtime y FP32.
- GPU recomendadas: no aplica para esta conversión; el modelo está pensado para CPUExecutionProvider.
- Cabe en cualquier CPU consumer: las mediciones se hicieron en un Ryzen 9 9950X3D, pero no se documentan requisitos mínimos de CPU ni de memoria RAM.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider) mediante el paquete `espaloma-onnx`, con dependencias de RDKit y NumPy; soporta carga desde Hugging Face (`espaloma-onnx[hf]`) y ModelScope (`espaloma-onnx[modelscope]`).
- Latencia y throughput: medianas de 2,69 ms (cafeína) y 11,81 ms (ciclosporina A, 196 átomos) en ejecución ONNX con 8 hilos; primera petición SMILES de 6,57 ms y peticiones posteriores de 3,0 ms medianos con Predictor residente.
- Configuración de ejecución: ejecución secuencial, un hilo inter-op, hilos intra-op configurables y thread spinning desactivado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Espaloma-onnx (esta ficha) | no disponible | no aplica (una molecula por peticion) | ONNX CPU: 2,69 ms (cafeina), 11,81 ms (ciclosporina A) | MIT | Hugging Face y ModelScope |
| Espaloma 0.3.2 original (DGL) | no disponible | no aplica | DGL CPU: 6,81 ms (cafeina), 23,61 ms (ciclosporina A) | no disponible en la informacion | Repositorio OpenFF/Espaloma |
| Otras conversiones ONNX de Espaloma | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas de la misma categoría (otros campos de fuerzas neuronales como ANIPNet o MACE-OFF) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- Las salidas son salidas crudas del checkpoint, no un sistema OpenMM; hay que consultar el código de despliegue original para multiplicidades, periodicidades, prefactores y conversión de unidades antes de construir una expresión de energía.
- No añade parámetros no enlazados ni un pipeline completo de campo de fuerzas.
- Los enlaces, ángulos y torsiones propias contienen duplicados directo/reverso; no deben sumarse directamente sin las convenciones de despliegue originales de Espaloma.
- Las torsiones impropias siguen la convención del checkpoint original, incluidas sus permutaciones.
- Los tests de validación (118) son seleccionados manualmente y no constituyen una validación exhaustiva del dominio químico ni de la exactitud de energías y fuerzas; los dos casos de H2 fallan por un bug de forma de array de ángulos vacío.
- Los sondeos de frontera (sodio aislado, sales, radicales, SMILES inválidos) miden consistencia numérica, no uso científico soportado.
- El preprocesamiento elimina información isotópica en el round-trip.
- El modelo procesa una molécula por petición; no hay procesamiento por lotes documentado.
- Idiomas: solo inglés en documentación e interfaz; no hay capacidades multilingües.
- Licencia MIT: permite uso comercial con atribución, pero no se documentan garantías ni responsabilidades del autor original de Espaloma 0.3.2.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero existe riesgo de extrapolación fuera del dominio químico validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/youmans/espaloma-onnx
- Repositorio del paquete y instrucciones de build: https://github.com/xiaoxuan-yu/espaloma-onnx
- Paper de referencia citado en los tags: arXiv:2010.01196
- Espaloma (Open Force Field): no disponible en la información proporcionada
- ONNX Runtime: no disponible en la información proporcionada
- Demos: no disponible en la información proporcionada
