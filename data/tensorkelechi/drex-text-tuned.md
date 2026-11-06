# tensorkelechi/DReX-text-tuned

## Resumen

DReX-text-tuned es un ajuste fino parcial del modelo DReX, un predictor de complejidad visual de imagenes desarrollado originalmente por Jonathan Skaza. DReX combina caracteristicas extraidas con DINOv3 y ResNet-50 para producir una puntuacion escalar que estima cuan compleja percibe una persona una imagen, entrenado con las valoraciones humanas del conjunto de datos IC9600. Este repositorio, publicado por el usuario tensorkelechi, no contiene el modelo completo sino unicamente las capas de fusion y de cabeza (fusion y head) reentrenadas, por lo que requiere el checkpoint original `DReX.pth` para funcionar.

El problema que aborda esta variante es concreto: en un tokenizador de imagenes de longitud variable, la puntuacion de complejidad de DReX se usa para decidir cuantos tokens recibe cada imagen. Como las personas valoran una pagina de texto como visualmente simple, el DReX original le asigna una puntuacion baja, lo que se traduce en muy pocos tokens y hace el texto ilegible tras la tokenizacion. Esta version reentrena las capas finales para que las paginas de texto se puntuen segun los tokens que necesitan para seguir siendo legibles, manteniendo congelados los backbones.

Es relevante porque demuestra una estrategia de adaptacion ligera (solo se sustituyen las capas de fusion y cabeza, con los backbones congelados) para reorientar un modelo de percepcion hacia una tarea downstream especifica, sin reentrenar desde cero. El autor advierte explicitamente de que esta version ya no es un predictor puro de complejidad humana: sobre texto predice lo que necesita un tokenizador, no la valoracion de una persona.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: backbones DINOv3 y ResNet-50 con capas de fusion y cabeza (solo estas reentrenadas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`drext.pt`), requiere el checkpoint original `DReX.pth` |

## Arquitectura y entrenamiento

DReX es un modelo de vision que combina caracteristicas de dos backbones, DINOv3 y ResNet-50, mediante capas de fusion y una cabeza de regresion que produce una puntuacion escalar de complejidad visual. En esta variante, los backbones permanecen congelados y solo se reentrenan las capas de fusion y de cabeza. El repositorio contiene exclusivamente esos pesos reemplazados (`fusion` y `head`), no el modelo completo.

El entrenamiento de esta version utiliza etiquetas derivadas de OCR sobre imagenes de documentos de los conjuntos DocLayNet, FUNSD y SynthDoG, y aplica una penalizacion para que las imagenes sin texto conserven su puntuacion original. Segun la model card, sobre 52 imagenes de test (casi todas no documentales) la puntuacion mediana se desplazo solo 0,015, con una correlacion de Spearman de 0,995 frente al DReX original, lo que indica que la adaptacion preserva el comportamiento previo en imagenes que no son documentos. No se detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset mas alla de las fuentes citadas.

## Capacidades

- Prediccion de una puntuacion escalar de complejidad visual para una imagen.
- Puntuacion de paginas de texto orientada a legibilidad tras tokenizacion, en lugar de a la valoracion humana de complejidad.
- Preservacion del comportamiento original en imagenes no documentales (Spearman 0,995 sobre el conjunto de test).
- Integracion en un tokenizador de imagenes de longitud variable para asignar presupuestos de tokens.
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues: es un modelo de regresion visual, no un modelo de lenguaje.
- No dispone de modo de razonamiento ni de vision general mas alla de la extraccion de caracteristicas de los backbones.

## Casos de uso

- Tokenizacion adaptativa de documentos: usar la puntuacion para asignar mas tokens a paginas de texto y preservar la legibilidad en pipelines de tokenizadores de imagenes de longitud variable.
- Procesamiento de documentos escaneados en pipelines de OCR: al puntuar el texto segun su necesidad de tokens, se evita que las paginas densas queden ilegibles antes de pasarlas a un motor de OCR como IndraOCR.
- Filtrado y priorizacion en ingestion de documentos: emplear la puntuacion para decidir que paginas requieren mayor resolucion o presupuesto computacional en un sistema de digitalizacion.
- Investigacion sobre percepcion de complejidad visual: comparar con el DReX original para estudiar como se comporta la puntuacion en documentos frente a imagenes naturales.
- Evaluacion de calidad de tokenizadores: usar el modelo como componente de medida en experimentos que comparan estrategias de asignacion de tokens en vision.
- Prototipado en entornos con recursos limitados: al requerir solo el reentrenamiento de las capas finales y mantener los backbones congelados, la adaptacion es ligera y facil de reproducir.

## Benchmarks y rendimiento

Resultados publicados en la model card, en su tokenizador sobre 63 paginas reservadas, contando una pagina como legible cuando IndraOCR recupera al menos el 90 % de las palabras que lee en el original:

| Presupuesto desde | Paginas legibles | Tokens medianos |
|---|---|---|
| DReX original | 8 % | 784 |
| Esta version | 60 % | 2.304 |
| Rejilla completa, sin adaptacion | 65 % | 2.304 |

Sobre 52 imagenes de test (casi todas no documentales), la puntuacion mediana se movio 0,015, con una correlacion de Spearman de 0,995 frente al original. Los presupuestos medianos de Mondrian subieron de 60 a 75 tokens.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; al combinar DINOv3 y ResNet-50, la huella dependera del tamano de esos backbones, no detallado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; depende del checkpoint original `DReX.pth`, cuyos requisitos no se especifican.
- Opciones de despliegue: inferencia en PyTorch cargando el checkpoint original y superponiendo los pesos `fusion` y `head` de este repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de vision de este tipo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DReX-text-tuned | Regresion de complejidad visual (ajuste parcial) | no disponible | no aplica | MIT | Hugging Face (solo capas finales) |
| DReX original | Regresion de complejidad visual | no disponible | no aplica | MIT | GitHub (`DReX.pth`) |
| Alternativas de prediccion de complejidad visual | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Ya no es un predictor puro de complejidad humana: sobre texto predice lo que necesita un tokenizador; para la valoracion humana debe usarse el DReX original.
- Evaluado solo con documentos impresos; no probado con texto en escena ni recibos.
- No alcanzo el umbral del 80 % de paginas legibles fijado de antemano, umbral que la propia rejilla completa tampoco logra.
- El repositorio contiene unicamente las capas `fusion` y `head`; sin el checkpoint original `DReX.pth` el modelo no es utilizable.
- Riesgo de sesgo y de alucinacion: no aplica en el sentido de generacion de texto, pero la puntuacion puede desviarse en dominios no vistos durante el ajuste.
- Restricciones de licencia: MIT, con copyright de Jonathan Skaza (2025); permite uso comercial segun los terminos de esa licencia.
- Para produccion: verificar el comportamiento en el tipo concreto de documentos objetivo, dado que las pruebas se limitan a documentos impresos y a un conjunto reducido de paginas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tensorkelechi/DReX-text-tuned
- Codigo y pesos originales de DReX: https://github.com/jskaza/DReX
- Paper de DReX: https://arxiv.org/abs/2511.16991
