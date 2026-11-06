# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch08

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch08` es un checkpoint de investigación derivado de Phi-1.5, publicado por el grupo unl-reset. Se trata de un modelo de lenguaje de 1.418 millones de parámetros (1,4 B) construido sobre el ajuste fino `locuslab/tofu_ft_phi-1.5`, que a su vez parte de `microsoft/phi-1_5`. Su propósito no es el uso general, sino servir como artefacto experimental dentro de la línea de trabajo TOFU (Task of Fictitious Unlearning), orientada al *machine unlearning*: eliminar selectivamente el conocimiento de un subconjunto del corpus de entrenamiento sin destruir el rendimiento general.

El checkpoint corresponde al epoch 8 de un entrenamiento de 20 epochs y aplica una receta concreta: inicialización de los *input embeddings* y de la cabeza LM desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan desde `locuslab/tofu_ft_phi-1.5`. La función de pérdida combina *token IHL* sobre el conjunto *forget* con una entropía cruzada (CE) ponderada por 1,0 sobre el conjunto *retain*. El identificador incluye el sufijo `forget10`, que en el marco TOFU designa el escenario de olvido del 10 % de los autores ficticios.

Es relevante ahora porque el *unlearning* se ha convertido en un requisito regulatorio y de gobernanza para modelos entrenados con datos sensibles o sujetos a solicitudes de borrado. Este checkpoint permite reproducir y auditar una variante específica (IHL + reset de embeddings/cabeza) frente a otras estrategias de olvido, y está pensado para ser evaluado con el arnés de TOFU, no para despliegue en producción. El modelo solo declara soporte de inglés y se distribuye con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5, con `custom_code`) |
| Parametros totales | 1.418.270.720 (1,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el repo no declara variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only denso de aproximadamente 1,4 B de parámetros, orientado originalmente a generación de código y razonamiento básico, con atención causal estándar. El checkpoint no introduce cambios estructurales; lo que varía es el proceso de ajuste. Según la model card, los *input embeddings* y la cabeza de lenguaje se reinicializan desde `microsoft/phi-1_5`, mientras que los pesos restantes del transformer se heredan de `locuslab/tofu_ft_phi-1.5`, el modelo ajustado con el dataset TOFU.

El entrenamiento aplica una pérdida compuesta: *token IHL* (una variante de la pérdida de *unlearning* basada en la entropía de la distribución del modelo) sobre el conjunto *forget*, más una entropía cruzada con coeficiente 1,0 sobre el conjunto *retain*. El escenario `forget10` implica que el objetivo de olvido abarca el 10 % de los autores ficticios del benchmark TOFU. El checkpoint corresponde al epoch 8 de 20, por lo que no es el estado final del entrenamiento. No se especifican en la información disponible el número de tokens vistos, la composición exacta del dataset más allá de las particiones forget/retain de TOFU, ni si hubo etapas de RLHF o DPO adicionales. El repositorio incluye un archivo `ihl_manifest.json` con los detalles de la receta, y requiere `trust_remote_code=True` por el uso de `custom_code`.

## Capacidades

- Generación de texto en inglés con un modelo denso de 1,4 B parámetros.
- Razonamiento básico y resolución de problemas sencillos, heredado de la base Phi-1.5.
- Generación de código a pequeña escala, capacidad original de Phi-1.5.
- Ajuste específico para *unlearning*: el modelo está entrenado para reducir la probabilidad de generar contenido asociado a los autores del conjunto *forget* de TOFU.
- No se declara soporte de *tool calling* ni de *function calling* en la información disponible.
- No se declara soporte de agentes ni de razonamiento multi-paso explícito.
- No se declara *thinking mode*, visión, audio ni otras modalidades.
- Capacidad multilingüe: solo inglés declarado.

## Casos de uso

- Evaluación de *machine unlearning*: usar el checkpoint como una de las variantes a comparar en el arnés TOFU, midiendo la caída de probabilidad sobre el conjunto *forget* frente a la retención en *retain*. Es su propósito principal y el escenario para el que fue entrenado.
- Investigación sobre inicialización de embeddings: al reinicializar *input embeddings* y cabeza LM desde `microsoft/phi-1_5`, permite estudiar el efecto del *reset* de esas capas en la capacidad de olvido y en la degradación del modelo.
- Reproducibilidad de recetas de olvido: el `ihl_manifest.json` y la nomenclatura del checkpoint permiten reconstruir la configuración (epoch 8/20, coeficiente CE 1,0, escenario forget10) y compararla con otras variantes del mismo grupo.
- Auditoría de privacidad: servir como línea base para medir si un modelo ajustado con datos ficticios de TOFU sigue filtrando información de los autores objetivo tras el proceso de olvido.
- Estudio de curvas de entrenamiento: al ser un checkpoint intermedio (epoch 8), es útil para analizar la evolución del olvido y de la retención a lo largo del entrenamiento, no solo en el estado final.
- Docencia y experimentación académica: modelo pequeño (1,4 B) que cabe en GPUs de consumo y permite ejecutar experimentos de olvido sin infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 1,5-2 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 0,8-1,2 GB de pesos (requiere convertir los safetensors a un formato cuantizado, no incluido en el repo).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores en FP16; en GPUs con 4 GB requiere cuantización.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía directa; llama.cpp/Ollama requieren conversión previa a GGUF, no incluida en el repo; vLLM y TGI no están verificados para este `custom_code` en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch08 | 1,4 B | no disponible | Unlearning TOFU (variante IHL + reset) | apache-2.0 | Hugging Face (0 descargas) |
| locuslab/tofu_ft_phi-1.5 | ~1,4 B | no disponible | Modelo base ajustado con TOFU, sin olvido | no disponible en la informacion | Hugging Face |
| microsoft/phi-1_5 | ~1,4 B | no disponible en la informacion | Generacion de codigo y texto en ingles | no disponible en la informacion | Hugging Face |

La comparación relevante es contra el modelo base `locuslab/tofu_ft_phi-1.5` (sin proceso de olvido) y contra `microsoft/phi-1_5` (origen de los embeddings y la cabeza LM). No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo listo para producción; su evaluación está pensada para el arnés TOFU.
- El escenario `forget10` y la pérdida IHL pueden degradar capacidades generales; no se aportan métricas de retención en la información disponible.
- Riesgo de alucinación inherente a un modelo de 1,4 B parámetros, agravado por el proceso de *unlearning*, que puede distorsionar distribuciones.
- Solo soporta inglés; no se declara cobertura multilingüe.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo deriva de Phi-1.5 y de un ajuste TOFU; conviene verificar las condiciones de los modelos base antes de cualquier uso comercial.
- El checkpoint corresponde al epoch 8 de 20, no al estado final; los resultados pueden diferir de la versión convergida.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria.
- No se especifican sesgos conocidos en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch08
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
