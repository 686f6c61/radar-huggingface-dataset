# talzoomanzoo/ttrl-aime2026-uid-conj-4b

## Resumen

`talzoomanzoo/ttrl-aime2026-uid-conj-4b` es un adaptador LoRA (PEFT) publicado por el usuario Minju Gwak (talzoomanzoo) sobre el modelo base Qwen/Qwen3-4B. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador y el tokenizador, por lo que para usarlo hay que cargar por separado Qwen/Qwen3-4B y aplicar el adaptador con la librería PEFT. El repositorio ocupa 0,1 GB y no acumula descargas ni "likes" en el momento de redactar esta ficha.

Por los metadatos de la model card, se trata de un artefacto de investigación: el adaptador se exportó en el paso de entrenamiento 2 de la ejecución `aime2026-lora16-seed42-20261009-022919-uid`, con rango LoRA 16 y alpha 32. El nombre y las etiquetas (`ttrl`, `uid-conj`, `aime2026`) apuntan a un experimento de aprendizaje por refuerzo en tiempo de test (TTRL) sobre problemas de tipo AIME, con un modo de preferencia denominado `uid`. La licencia, los idiomas soportados y el contexto efectivo no están declarados.

Su relevancia es, por tanto, exclusivamente experimental: sirve para reproducir o auditar una ejecución de entrenamiento muy temprana, no como modelo listo para producción. Cualquier despliegue real debería partir de Qwen/Qwen3-4B y tratar este adaptador como un punto de partida a validar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso; modelo base Qwen/Qwen3-4B |
| Parámetros totales | No disponible para el adaptador; el modelo base, por su denominación, ronda los 4.000 millones de parámetros |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No especificada en esta ficha; heredada del modelo base Qwen/Qwen3-4B |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (pesos del adaptador LoRA; requiere el modelo base aparte) |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Tokenizador | Incluido en el repositorio (el del modelo base) |
| Paso de exportación | 2 |
| Ejecución de entrenamiento | aime2026-lora16-seed42-20261009-022919-uid |
| Modo de preferencia | uid |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se apoya en Qwen/Qwen3-4B, un transformer decoder-only denso. La relación declarada es `base_model_relation: adapter`, lo que confirma que no se han fusionado los pesos: el adaptador se aplica en tiempo de carga sobre el modelo base. Los hiperparámetros documentados son rango LoRA 16 y alpha 32, valores habituales para ajuste eficiente de un modelo de este tamaño.

La model card indica que el adaptador se exportó en el paso de entrenamiento 2, un punto extremadamente temprano de la ejecución. Las etiquetas `ttrl` (Test-Time Reinforcement Learning) y `uid-conj`, junto con el nombre `aime2026`, sugieren un entrenamiento orientado a razonamiento matemático con datos de tipo AIME y un esquema de preferencias `uid`, pero no se aporta información sobre el volumen de tokens, la composición del dataset, ni si hubo fases de SFT, RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). No se dispone de más detalle sobre el proceso de entrenamiento en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento: el adaptador hereda las capacidades del modelo base Qwen/Qwen3-4B; no se documentan capacidades adicionales específicas del adaptador.
- Razonamiento matemático: el nombre y las etiquetas (`aime2026`) apuntan a un ajuste orientado a problemas de competición tipo AIME, aunque no se aportan métricas que lo confirmen.
- Soporte de tool calling / function calling: no disponible en esta ficha; depende del modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible; sin evidencia documentada en el repositorio.
- Capacidades multilingües: no disponible; los idiomas soportados no están declarados.
- Capacidades especiales (modo "thinking", visión, audio): no disponible. No se documenta ningún modo de razonamiento extendido ni modalidad adicional.
- Conversación multi-turno: la etiqueta `conversational` está presente, pero no hay ejemplos ni configuración de plantilla de chat documentados para el adaptador.

## Casos de uso

- Reproducción de experimentos de TTRL: el adaptador permite volver a cargar un punto concreto (paso 2) de una ejecución de aprendizaje por refuerzo en tiempo de test y comparar su comportamiento con otros adaptadores de la misma familia.
- Investigación en razonamiento matemático: sirve como punto de partida para estudiar cómo evoluciona el rendimiento en problemas tipo AIME conforme avanza el entrenamiento, cargando el adaptador con PEFT sobre Qwen/Qwen3-4B.
- Estudio de esquemas de preferencia: la etiqueta `uid` permite comparar este adaptador con otros adaptadores del mismo autor entrenados con modos de preferencia distintos, aislando el efecto del esquema de alineación.
- Fine-tuning incremental sobre el adaptador: al ser un LoRA de rango 16, se puede continuar el entrenamiento o combinarlo con otros adaptadores (por ejemplo, mediante fusión de pesos) para prototipado rápido.
- Evaluación comparativa de adaptadores LoRA: útil como elemento de control negativo o positivo en pipelines internos que midan el impacto de adaptadores de bajo rango sobre un modelo base de 4B.
- Docencia y demostraciones de ajuste eficiente: dado su tamaño reducido (0,1 GB) y su naturaleza de adaptador, es adecuado para ilustrar el flujo PEFT + modelo base en entornos con recursos limitados.
- Despliegue experimental en tareas de matemáticas: solo como prueba de concepto, ya que no hay evidencia de calidad ni de estabilidad en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso del adaptador: 0,1 GB en disco; el consumo real lo determina el modelo base Qwen/Qwen3-4B, no el adaptador.
- VRAM estimada para el modelo base (orientativa, según cuantización): en FP16 en torno a 8-9 GB; en INT8 en torno a 4-5 GB; en 4 bits en torno a 2,5-3 GB. Estas cifras son estimaciones generales para un modelo denso de ~4B parámetros y no proceden de la información proporcionada.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 12 GB, RTX 4070, RTX 4090); A100 y H100 para despliegue concurrente a mayor escala.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en modelos de gama media-alta con 8-12 GB o más, siempre que se use el modelo base en cuantización adecuada.
- Opciones de despliegue: PEFT + transformers (carga directa del adaptador); vLLM con soporte de adaptadores LoRA; TGI con adaptadores; llama.cpp u Ollama solo si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ttrl-aime2026-uid-conj-4b | Adaptador LoRA sobre ~4B (rango 16, alpha 32) | No especificado | No disponible | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B (modelo base) | ~4.000 M | Según ficha del modelo base | No disponible en esta ficha | No disponible en esta ficha | Ampliamente disponible |
| ttrl-aime2026-sc | No disponible | No disponible | No disponible | No disponible | Endpoint en FriendliAI y HuggingFace |
| Otros adaptadores LoRA de razonamiento matemático | Variable | No disponible | No disponible | Variable | HuggingFace |

No se dispone de datos suficientes para establecer una comparativa cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluación de sesgos para este adaptador.
- Riesgo de alucinación: heredado del modelo base Qwen/Qwen3-4B; puede generar razonamientos matemáticos plausibles pero incorrectos, especialmente en problemas de varios pasos.
- Artefacto de investigación sin validar: se exportó en el paso de entrenamiento 2, un punto muy temprano, y no hay métricas que respalden su calidad. No debe usarse en producción sin una evaluación exhaustiva.
- Restricciones de licencia: la licencia del adaptador no está declarada. Antes de cualquier uso comercial, hay que verificar la licencia del modelo base Qwen/Qwen3-4B y contactar con el autor para aclarar la del adaptador.
- Limitaciones de contexto e idioma: ni el contexto efectivo ni los idiomas soportados están documentados en esta ficha, por lo que no se puede garantizar un comportamiento multilingüe ni un límite de contexto concreto.
- Dependencia del modelo base: el repositorio no contiene pesos fusionados; sin cargar Qwen/Qwen3-4B y PEFT, el adaptador no es funcional por sí solo.
- Sin soporte documentado de tool calling ni de agentes: no hay evidencia en el repositorio de que el adaptador conserve o mejore estas capacidades.
- Sin historial de descargas ni validación por la comunidad: 0 descargas y 0 "likes" en el momento de redactar esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/talzoomanzoo/ttrl-aime2026-uid-conj-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset del autor: https://huggingface.co/datasets/talzoomanzoo/aime26
- Perfil del autor en HuggingFace: https://huggingface.co/talzoomanzoo/datasets
- Perfil del autor en GitHub: https://github.com/talzoomanzoo/
- Ficha en free2aitools: https://free2aitools.com/model/talzoomanzoo/ttrl-aime2026-uid-conj
- Adaptador relacionado en FriendliAI: https://friendli.ai/models/talzoomanzoo/ttrl-aime2026-sc
