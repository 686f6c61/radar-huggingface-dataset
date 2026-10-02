# Zoey6655/Qwen3-32B-English-Jacobian-Lens

## Resumen

Qwen3-32B-English-Jacobian-Lens es un artefacto de interpretabilidad, no un modelo de lenguaje: se trata de una lente jacobiana (Jacobian lens) ajustada sobre el modelo denso Qwen/Qwen3-32B. La publica el usuario Zoey6655 en HuggingFace y su contenido es un unico fichero de matrices (`lens.pt`) de 3,30 GB, acompanado de metricas de convergencia, un manifiesto con checksums y un script para reproducir la figura de convergencia. Los pesos del modelo base no se incluyen y deben descargarse por separado.

El artefacto sirve para leer que esta "dispuesto a decir" el modelo a partir de una activacion interna: transporta linealmente un vector del residual stream de cualquier capa y posicion a la base de la capa final y lo decodifica con el propio unembedding del modelo, produciendo una lista ordenada de tokens. Es relevante porque permite estudiar el flujo de informacion capa a capa en un modelo de 32.800 millones de parametros sin entrenar nada nuevo, y porque el autor documenta la receta de ajuste con hashes de corpus, tokenizador y fitter.

El ajuste se realizo con 1.200 prompts en ingles y convergio con un cambio relativo medio de los ultimos 10 bloques del 0,199724%, por debajo del umbral de parada configurado del 0,2%. Se trata de una metrica de estabilidad numerica de las matrices ajustadas, no de una evaluacion de calidad downstream: el repositorio no incluye prompts de entrenamiento, codigo fuente del ajuste original ni evaluacion de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lente jacobiana: 63 matrices de transporte lineal de 5.120 x 5.120 sobre el residual stream de Qwen3-32B (transformer causal denso) |
| Parametros totales | 1.651.507.200 en la lente (calculado: 63 x 5.120 x 5.120); 32.800 millones en el modelo base Qwen3-32B |
| Parametros activos | no aplica (ni la lente ni Qwen3-32B son MoE) |
| Longitud de contexto | no aplica a la lente; secuencia maxima durante el ajuste: 128 tokens. Modelo base: 131.072 tokens segun el catalogo de Microsoft Foundry |
| Tipos de cuantizacion | no disponible; el artefacto se guarda en `torch.float16` y se promociona a FP32 en memoria al cargarlo |
| Idiomas soportados | en (ingles) para el corpus de ajuste; el modelo base soporta mas de 100 idiomas segun el catalogo de Microsoft Foundry |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`), matrices en `torch.float16`; no incluye safetensors ni GGUF |

## Arquitectura y entrenamiento

La lente no es un modelo generativo sino un conjunto de transformaciones lineales aprendidas. Cada una de las 63 matrices (indices de capa 0-62) mapea un vector del residual stream de Qwen3-32B, en cualquier capa y posicion, a la base de la capa final; ese vector transportado se decodifica con el unembedding del propio modelo y da una lista de tokens ordenada por probabilidad, segun la descripcion del repositorio anthropics/jacobian-lens. El fichero `lens.pt` es el artefacto de entrenamiento `lens_n1200.pt` renombrado sin conversion ni modificacion, y conserva los valores FP16 originales (convertirlos a FP32 o FP64 no recupera la precision perdida al guardar).

El ajuste uso 1.200 prompts en ingles, con el modelo base en BF16, dimension oculta de 5.120, longitud de secuencia maxima de 128, tamano de lote de dimension 8 y semilla 20260707. La convergencia se alcanzo en el prompt 1.200 con un cambio relativo medio de los ultimos 10 bloques de 0,199724%, por debajo del umbral del 0,2%. El CSV de convergencia solo cubre los prompts 185-1200 porque el ajuste se reanudo desde un estado previo de 184 prompts cuyo historial metrico no se incluye; los 1.007 promedios completos de 10 bloques disponibles se comprobaron de forma independiente contra los cambios por bloque. El manifiesto `lens_manifest.json` registra el checksum SHA256, los metadatos de tensores, los resultados de validacion y los hashes de los ficheros origen, y `training_result.json` incluye la politica de parada, la receta de ajuste y los hashes de corpus, tokenizador y fitter. La revision exacta del modelo base usada en el ajuste no quedo registrada, por lo que la identidad de revision no esta verificada de forma independiente.

## Capacidades

- Lectura de activaciones internas: traduce un vector del residual stream de cualquier capa (0-62) y posicion a una distribucion sobre el vocabulario, permitiendo inspeccionar que token "favorece" una activacion concreta.
- Analisis capa a capa: al disponer de una matriz por capa, permite comparar como evoluciona la representacion a lo largo de la profundidad del modelo.
- Reproduccion de metricas: incluye `plot_qwen_jlens_csv.py` para regenerar la figura de convergencia en PNG, SVG y PDF y verificar los promedios de ventana y los indicadores de parada.
- Verificacion de integridad: el manifiesto permite comprobar checksums y hashes de procedencia.
- No genera texto, no razona, no escribe codigo ni resuelve matematicas: todas esas capacidades residen en el modelo base Qwen3-32B, que debe cargarse aparte.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso por si misma.
- No tiene capacidades de vision ni audio.
- No dispone de modo "thinking"; el modo hibrido de razonamiento es una caracteristica de Qwen3-32B, no de la lente.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: aplicar la lente a activaciones de capas intermedias de Qwen3-32B para localizar en que profundidad emerge la prediccion de un token concreto, usando la matriz correspondiente al indice de capa 0-62.
- Auditoria de seguridad de modelos: inspeccionar que tokens promueve una activacion en capas tardias ante entradas potencialmente daninas, con el objetivo de detectar representaciones internas problematicas antes de que se materialicen en la salida.
- Analisis de logit lens comparativo: contrastar la lectura de la lente jacobiana con un logit lens clasico capa a capa para medir cuanto de la prediccion final es linealmente decodificable en cada nivel.
- Depuracion de comportamientos anomalos: ante una respuesta incorrecta o alucinada de Qwen3-32B, inspeccionar las activaciones de capas intermedias para identificar donde diverge la representacion del contenido esperado.
- Estudio de transferencia entre idiomas: aun con un corpus de ajuste en ingles, emplear la lente para examinar activaciones generadas con prompts en otros idiomas y comprobar si el espacio de representacion converge en capas altas.
- Docencia y divulgacion: servir de material practico en cursos de interpretabilidad, ya que el script de reproduccion no requiere modelo base ni GPU y el artefacto se carga en CPU.
- Base para nuevos ajustes de lentes: usar la receta documentada y los hashes de procedencia como punto de partida para ajustar lentes sobre otros modelos o corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluacion de calidad downstream y el autor lo advierte explicitamente. La unica metrica registrada es de convergencia numerica del ajuste:

| Metrica | Valor |
|---|---|
| Prompts de ajuste | 1.200 |
| Cambio relativo medio de los ultimos 10 bloques | 0,199724% |
| Umbral de parada configurado | 0,2% |
| Promedios completos de 10 bloques disponibles | 1.007 |
| Rango cubierto por el CSV | prompts 185-1200 |

## Requisitos de hardware

- Almacenamiento: 3,30 GB para `lens.pt` (3.303.032.772 bytes).
- Memoria al cargar: aproximadamente 6,61 GB para las matrices promocionadas a FP32 en memoria, mas la sobrecarga de carga. La implementacion probada de `JacobianLens.load` promociona a FP32 automaticamente.
- Carga e inspeccion del artefacto: solo CPU, no requiere GPU. La carga de la lente no carga el modelo Qwen3-32B.
- Generacion de la figura de convergencia: `plot_qwen_jlens_csv.py` no necesita modelo base ni GPU; basta con instalar `requirements.txt`.
- Para usar la lente sobre activaciones reales hace falta ademas ejecutar Qwen3-32B: aproximadamente 65,6 GB en BF16 o FP16, en torno a 33 GB en FP8 y alrededor de 18-20 GB en cuantizacion de 4 bits (estimaciones derivadas de los 32.800 millones de parametros).
- GPU recomendadas para el modelo base, segun la cuantizacion: A100 80 GB o H100 80 GB en BF16; una o dos RTX 4090 de 24 GB para cuantizaciones de 4 bits.
- Despliegue: no disponible para la lente. Para el modelo base, segun el ecosistema habitual de Qwen3, cabria usar vLLM, TGI, llama.cpp u Ollama, aunque no se han publicado datos de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zoey6655/Qwen3-32B-English-Jacobian-Lens | Lente jacobiana para Qwen3-32B, 1.200 prompts en ingles | 1.651.507.200 (calculado) | 3,30 GB (`lens.pt`, FP16) | no disponible | 0 descargas, 0 likes |
| neuronpedia/jacobian-lens (carpeta `qwen3-32b`) | Lente jacobiana para Qwen3-32B publicada por Neuronpedia | no disponible | 6,61 GB | MIT | 94 likes en el repositorio |
| anthropics/jacobian-lens | Codigo companero del metodo de lente jacobiana | no aplica (codigo) | no disponible | no disponible | repositorio publico en GitHub |
| Qwen/Qwen3-32B | Modelo de lenguaje causal denso, base de la lente | 32.800 millones | no disponible | no disponible | modelo base de referencia |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni ejecuta tareas de NLP. Cualquier evaluacion de capacidades debe hacerse sobre Qwen3-32B.
- El corpus de ajuste es exclusivamente en ingles y de solo 1.200 prompts; la lente puede comportarse de forma menos fiable con activaciones procedentes de otros idiomas.
- La longitud de secuencia usada durante el ajuste fue de 128 tokens, muy inferior a la ventana de 131.072 tokens del modelo base; no se ha validado el comportamiento de la lente en contextos largos.
- La licencia no esta declarada en la informacion disponible, por lo que el uso comercial queda en situacion juridica indeterminada.
- La revision exacta del modelo base usada en el ajuste no se registro, asi que la reproducibilidad exacta no esta garantizada.
- El repositorio no incluye los prompts de entrenamiento, el codigo fuente original del ajuste ni una evaluacion completa de benchmarks, segun indica el propio autor.
- La metrica del 0,199724% mide unicamente la estabilidad numerica del ajuste, no la calidad de las lecturas que produce la lente.
- El CSV de convergencia solo cubre los prompts 185-1200; el historial anterior, correspondiente a los 184 prompts previos, no esta disponible.
- Las matrices se guardaron en FP16 y perdieron precision de forma irreversible; promocionarlas a FP32 o FP64 en memoria no recupera esa precision.
- La interpretabilidad basada en lentes es una herramienta de analisis, no una prueba concluyente: las lecturas deben contrastarse con otras tecnicas antes de extraer conclusiones sobre el comportamiento del modelo.
- El artefacto tiene 0 descargas y 0 likes y fue creado el 2026-10-01, por lo que no cuenta con validacion independiente por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Zoey6655/Qwen3-32B-English-Jacobian-Lens
- Modelo base Qwen3-32B: https://huggingface.co/Qwen/Qwen3-32B
- Neuronpedia, lente jacobiana para qwen3-32b: https://huggingface.co/neuronpedia/jacobian-lens/tree/main/qwen3-32b
- Neuronpedia, carpeta jlens: https://huggingface.co/neuronpedia/jacobian-lens/tree/main/qwen3-32b/jlens
- Codigo companero de anthropics/jacobian-lens: https://github.com/anthropics/jacobian-lens
- Ficha de Qwen3-32B en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3-32b-qwen
- Catalogo de Microsoft Foundry para qwen3-32b: https://ai.azure.com/catalog/models/qwen3-32b
