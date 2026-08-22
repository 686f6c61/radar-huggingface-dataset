# tbhrc/qwen3_5_4b_unsloth_mlx_oq3

## Resumen

El repositorio `tbhrc/qwen3_5_4b_unsloth_mlx_oq3` contiene una versión cuantizada a 3 bits del modelo Qwen3.5-4B, realizada mediante la herramienta oQ (mixed-precision quantization). El resultado se ofrece en formato MLX safetensors, pensado para su ejecución en dispositivos con Apple Silicon. Aunque la nomenclatura sugiere un modelo de 4 mil millones de parámetros, los datos reales de safetensors indican 887.517.696 parámetros, una discrepancia que no se aclara en la ficha. Esta cuantización reduce el tamaño del modelo para facilitar su despliegue en entornos con memoria limitada, pero no se aportan detalles sobre el modelo base, sus capacidades ni su licencia. La fecha de creación (2026-08-22) es posterior al conocimiento actual, lo que sugiere que se trata de un lanzamiento reciente o una entrada con datos ficticios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 887.517.696 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits, group size 64 (oQ3) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura del modelo original ni sobre los datos de entrenamiento. La ficha solo indica que se trata de una cuantización de un modelo Qwen3.5-4B, realizada con la herramienta oQ de cuantización mixta de precisión. No se detallan innovaciones técnicas, técnicas de entrenamiento como RLHF o DPO, ni el número de tokens utilizados. La cuantización a 3 bits con group size 64 es la única característica técnica documentada.

## Capacidades

No se han documentado capacidades específicas para esta cuantización. Se espera que herede las capacidades del modelo base Qwen3.5-4B, pero no se dispone de información al respecto en la ficha. No se menciona soporte para tool calling, agentes, visión, audio, ni otras funcionalidades. La ausencia de datos impide confirmar cualquier habilidad concreta.

## Casos de uso

No se han documentado casos de uso específicos para este modelo en la información proporcionada. Al ser una cuantización en formato MLX, su aplicación natural es la inferencia local en dispositivos Apple Silicon con memoria reducida. Podría emplearse en experimentación, prototipado o despliegues en los que la huella de memoria sea crítica, pero no se pueden afirmar capacidades concretas sin conocer el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de hardware en la ficha.
- Con 887 millones de parámetros y cuantización a 3 bits, el peso del modelo ocupa aproximadamente 0,3 GB (887M × 3 bits / 8). El tamaño del repositorio (2,6 GB) sugiere que incluye otros archivos adicionales, como el modelo sin cuantizar o documentación.
- Se recomienda un dispositivo con Apple Silicon (M1 o superior) para ejecutar MLX.
- La memoria mínima estimada para inferencia sería de unos 1-2 GB de RAM unificada, aunque no hay datos confirmados.
- No se indican opciones de despliegue (vLLM, llama.cpp, Ollama, etc.) ni latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la ficha. Al no conocerse el modelo base, no se puede realizar una comparativa fiable con alternativas como Qwen3-4B o Qwen2.5-7B. Se recomienda consultar la documentación oficial de Qwen para obtener comparaciones.

## Limitaciones y advertencias

- La cuantización a 3 bits puede degradar la calidad de las respuestas y aumentar el riesgo de alucinaciones.
- La licencia no está especificada, por lo que el uso comercial es incierto y podría violar términos del modelo base.
- No se informa sobre sesgos, limitaciones de idioma o contexto.
- Existe una discrepancia entre el nombre del modelo (4B) y los parámetros reales (887M), lo que sugiere una posible confusión o un modelo modificado.
- No hay información sobre el modelo base, lo que impide conocer sus capacidades y limitaciones reales.

## Enlaces

- [Repositorio Hugging Face](https://huggingface.co/tbhrc/qwen3_5_4b_unsloth_mlx_oq3)
- [Herramienta oQ (repositorio GitHub)](https://github.com/jundot/omlx)
- [Notebook de Qwen3.5-4B Vision en Colab](https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Qwen3_5_(4B)_Vision.ipynb)
- [Colección de Qwen3 de unsloth](https://huggingface.co/collections/unsloth/qwen3)
- [Página de unsloth](https://unsloth.ai/)
