# xudongwu/SafeSelfPlay-checkpoints

## Resumen

SafeSelfPlay-checkpoints es un repositorio de adaptadores PEFT (LoRA) publicados por Xudong Wu, investigador doctoral en la Universidad de Hong Kong, especializado en aprendizaje por refuerzo, alineación de LLM y sistemas agénticos. El proyecto SafeSelfPlay propone un método de entrenamiento basado en self-play para mejorar la seguridad de los modelos de lenguaje, utilizando un enfoque de refuerzo con roles enfrentados (red team y blue team) para generar respuestas más robustas frente a ataques adversarios.

El repositorio contiene checkpoints de adaptadores LoRA organizados en `lora/A1` a `lora/D3`, que son los adaptadores canónicos específicos de rol, además de una reproducción del método Self-RedTeam público. El modelo base es `mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated`, una variante de Llama 3.1 8B Instruct a la que se le ha aplicado la técnica de "abliteration" para eliminar los mecanismos de rechazo. Este conjunto de adaptadores está pensado para la investigación en seguridad y alineación de modelos, no como un producto listo para producción.

La relevancia actual radica en el creciente interés por métodos de alineación que no dependen exclusivamente de RLHF clásico, sino que exploran dinámicas de juego entre agentes para descubrir vulnerabilidades y reforzar comportamientos seguros. Sin embargo, el repositorio tiene cero descargas y cero likes, lo que sugiere que es un recurso de investigación reciente o poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Llama 3.1 8B Instruct) |
| Parametros totales | no disponible (adaptadores LoRA, el modelo base tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, presumiblemente 128k) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT) |

## Arquitectura y entrenamiento

El repositorio contiene adaptadores LoRA (PEFT) que se aplican sobre el modelo base `mlabonne/Meta-Llama-3.1-8B-Instruct-abliterated`. Este modelo base es una versión de Llama 3.1 8B Instruct a la que se le ha aplicado "abliteration", una técnica que elimina selectivamente las direcciones en el espacio de activaciones asociadas con el rechazo de instrucciones dañinas, dando como resultado un modelo que responde sin filtros de seguridad. Sobre esta base, SafeSelfPlay entrena adaptadores LoRA mediante un esquema de self-play con dos roles: un "red team" que intenta generar respuestas dañinas o inseguras, y un "blue team" que intenta producir respuestas seguras y útiles. El entrenamiento utiliza aprendizaje por refuerzo, con registro de métricas de seguridad, matrices de recompensa y curvas de entrenamiento en W&B. El repositorio incluye soporte para medir la divergencia KL desde el inicio de cada rol, permitiendo comparar cada adaptador contra su propio punto de partida.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni el algoritmo exacto de RL (PPO, GRPO, etc.). La reproducción de Self-RedTeam se basa en un commit público, pero los pesos oficiales de los autores están en una colección separada.

## Capacidades

- Adaptadores LoRA específicos para roles en un escenario de self-play de seguridad (red team y blue team).
- Entrenados mediante aprendizaje por refuerzo para mejorar la seguridad de las respuestas del modelo base.
- Capacidad de cargarse sobre el modelo base abliterado para experimentos de alineación.
- Soporte para medir divergencia KL por rol, lo que permite análisis finos del entrenamiento.
- No se documentan capacidades de generación de código, tool calling, visión u otras habilidades generales; el foco es exclusivamente la seguridad.

## Casos de uso

- Investigación en alineación de modelos: el repositorio sirve como punto de partida para estudiar cómo el self-play entre roles puede reducir comportamientos inseguros en LLMs. Un investigador puede cargar los adaptadores sobre el modelo base y evaluar las respuestas ante prompts adversarios.
- Reproducción de experimentos de seguridad: dado que incluye una reproducción de Self-RedTeam, permite comparar metodologías y verificar resultados publicados.
- Desarrollo de métodos de red teaming automatizado: los adaptadores del rol "red team" pueden usarse para generar ataques o prompts dañinos que sirvan para evaluar la robustez de otros modelos.
- Entrenamiento de modelos defensivos: los adaptadores del rol "blue team" pueden integrarse en pipelines de fine-tuning para reforzar la seguridad en modelos desplegados.
- Análisis de dinámicas de juego en RL: el repositorio ofrece checkpoints intermedios (A1-D3) que permiten estudiar la evolución de las políticas durante el entrenamiento.
- Benchmarking de técnicas de ablación: al estar basado en un modelo abliterado, permite comparar el efecto del self-play frente a otras técnicas de eliminación de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. La ausencia de datos de rendimiento limita la comparación objetiva con otros métodos de alineación.

## Requisitos de hardware

- Al ser adaptadores LoRA, el requisito principal es el del modelo base Llama 3.1 8B Instruct. En FP16, el modelo base ocupa aproximadamente 16 GB de VRAM, por lo que se necesita una GPU con al menos 16 GB (por ejemplo, RTX 4090, A100 40GB, etc.).
- Los adaptadores LoRA añaden una sobrecarga mínima de memoria (del orden de cientos de MB), por lo que el requisito práctico es similar al del modelo base.
- Para inferencia, se puede usar vLLM, llama.cpp, Ollama o TGI, siempre que soporten la carga de adaptadores PEFT. En el caso de llama.cpp, se requiere convertir los adaptadores a formato GGUF, lo cual no está documentado en el repositorio.
- No se proporcionan datos de latencia o throughput. Se estima que en una GPU moderna (A100 o RTX 4090) la inferencia con el modelo base de 8B es de decenas de tokens por segundo, pero esto depende de la implementación y la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El repositorio es un conjunto de adaptadores de investigación, no un modelo independiente. Como referencia, se podría comparar con otros métodos de alineación basados en self-play como Self-RedTeam (del cual se incluye una reproducción) o SPIN (Self-Play Fine-Tuning), pero no hay datos de rendimiento en este repositorio. La comparativa queda pendiente de que el autor publique resultados.

## Limitaciones y advertencias

- El repositorio está orientado a investigación; no se recomienda su uso en producción sin una evaluación exhaustiva de seguridad.
- El modelo base abliterado elimina los mecanismos de rechazo, lo que puede generar respuestas dañinas si no se aplican los adaptadores adecuados. El uso del adaptador "red team" es especialmente peligroso en entornos no controlados.
- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial o modificación.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas. Al estar basado en Llama 3.1, hereda las limitaciones del modelo base, pero no se confirma.
- La ausencia de benchmarks y documentación detallada dificulta la evaluación de su eficacia real frente a otros métodos.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xudongwu/SafeSelfPlay-checkpoints
- GitHub del proyecto: https://github.com/xudongwu-0/SafeSelfPlay
- Página personal del autor: https://xudongwu-0.github.io/
- Colección oficial de Self-RedTeam: https://huggingface.co/collections/mickelliu/self-redteam-68f72b48c4beea864617fe4c
