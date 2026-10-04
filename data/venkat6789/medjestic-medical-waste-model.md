# Venkat6789/MEDjestic-medical-waste-model

## Resumen

MEDjestic-ViT-B16-v1.0.0 es un clasificador de imagen basado en Vision Transformer (ViT-B/16) afinado para la clasificacion de residuos biomedicos y clinicos. Lo publica el autor Venkat6789 bajo el paraguas del "MEDjestic Engineering Team" en HuggingFace, y adapta investigacion de referencia de Sivakumar et al. El modelo resuelve la clasificacion de residuos medicos en 12 clases clinicas mapeadas a los flujos de eliminacion de residuos biomedicos de la Organizacion Mundial de la Salud (OMS).

Arquitectonicamente es un `vit_b_16` estandar con una capa lineal de clasificacion de 13 salidas (una de ellas reservada/quarantined) y una entrada de 224x224 RGB. Cuenta con aproximadamente 86 millones de parametros y un state_dict de 327,4 MB. No dispone de contexto textual: es un modelo puramente de vision.

Su relevancia radica en la aplicacion concreta: segmentar residuos clinicos por categoria de contenedor (amarillo, rojo, azul, negro) para asistir en auditorias de residuos, registros de eliminacion en EMR hospitalarios y contenedores medicos inteligentes. El modelo es pequeno, cabe en hardware de consumo y se publica con licencia MIT, lo que facilita su integracion en sistemas de punto de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B/16), parches 16x16, capa lineal de clasificacion de 13 salidas |
| Parametros totales | ~86 millones |
| Longitud de contexto | no aplica (clasificacion de imagen; entrada 224x224 RGB) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | state_dict de PyTorch (327,4 MB); safetensors no disponible |

## Arquitectura y entrenamiento

El modelo emplea un Vision Transformer `vit_b_16`, la variante base con parches de 16x16 pixeles. La imagen de entrada se divide en parches, se proyecta a embeddings y se procesa mediante bloques de self-attention, tras lo cual una cabeza lineal produce la clasificacion final. La capa de clasificacion tiene 13 salidas entrenadas, si bien una de ellas (indice 7) esta reservada y cuarentenada (etiquetada como `.DS_Store` / invalida), de modo que las clases operativas reales son 12. La resolucion de entrada es de 224x224 en RGB.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El modelo se entreno sobre el dataset "Pharmaceutical-and-Biomedical-Waste" y se referencia como una adaptacion de la investigacion de Sivakumar et al. Como innovacion operativa, incorpora un mecanismo de rechazo de entradas no medicas mediante un umbral de confianza baja de 0,60 y un margen de 0,20, que deriva las entradas dudosas a un estado `Uncertain`.

## Capacidades

- Clasificacion de imagen de residuos medicos en 12 clases clinicas: tejido u organo corporal, equipamiento de vidrio, equipamiento metalico, residuo organico, equipamiento plastico, equipamiento de papel, agujas de jeringuilla, gasa, guantes, mascarillas, jeringuillas y pinzas.
- Mapeo de cada clase a su flujo de residuo biohazard de la OMS (Biohazard, Sharps, Recyclable, Infectious, General) y al contenedor por defecto (amarillo, rojo, azul, negro).
- Clasificacion de imagen completa (whole-image), sin generacion de bounding boxes.
- Deteccion de entradas no medicas o ruido mediante umbral de rechazo (confianza < 0,60 con margen 0,20) hacia el estado `Uncertain`.
- Capacidades multilingues: no disponibles (solo etiquetas en ingles).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo generativo ni agentico).

## Casos de uso

- Auditoria de residuos clinicos en punto de uso: el modelo clasifica cada residuo capturado por camara y lo asigna al contenedor correcto (amarillo, rojo, azul o negro), reduciendo errores de segregacion en planta.
- Registro de eliminacion en EMR hospitalario: integrado en el sistema de historial electronico, etiqueta automaticamente los residuos generados por procedimiento para trazabilidad regulatoria.
- Asistencia en contenedores medicos inteligentes: la clasificacion en tiempo real permite que un contenedor abra unicamente el compartimento correspondiente a la categoria detectada.
- Formacion del personal sanitario: sirve como herramienta de retroalimentacion que indica si un residuo se esta depositando en el contenedor correcto.
- Monitorizacion de cumplimiento normativo: genera metricas sobre el volumen y tipo de residuos por area hospitalaria para auditorias de conformidad con la OMS.
- Clasificacion de material de laboratorio y quirurgico: distingue entre vidrio, metal, plastico y papel para separar residuos reciclables del flujo biohazard.
- Filtrado previo en pipelines de vision: actua como primer clasificador que descarta imagenes no medicas (estado `Uncertain`) antes de pasarlas a sistemas mas costosos.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precision de validacion | 88,33 % (sobre el split de validacion de residuos clinicos) |
| Confianza clase "Masks" | 99,9 % |
| Confianza clase "Syringes" | 99,9 % |
| Confianza clase "Gloves" | 98,6 % |
| Umbral de rechazo de desconocidos/ruido | 0,60 de confianza con margen de 0,20 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; estos benchmarks no son aplicables a un modelo de clasificacion de imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,33 GB en fp32 (327,4 MB de pesos), alrededor de 0,17 GB en fp16 y cerca de 0,09 GB en int8. Con overhead de runtime, un entorno practico ocupa del orden de 1 a 2 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM es suficiente dado el tamano del modelo. No se requiere A100, H100 ni RTX 4090; estas serian sobredimensionadas para inferencia individual.
- Cabe holgadamente en GPUs de consumo: GTX 1650, RTX 3060, RTX 4060 y superiores, asi como en GPUs integradas modestas.
- Es viable la inferencia en CPU para cargas de baja frecuencia, dado el reducido numero de parametros.
- Opciones de despliegue: PyTorch / torchvision (arquitectura `vit_b_16`), exportacion a ONNX Runtime, TorchScript. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aqui).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables publicados en la informacion proporcionada. Como referencia, el modelo parte de la arquitectura estandar ViT-B/16 (~86 millones de parametros, entrada 224x224), por lo que su coste computacional y de memoria es equiparable al de cualquier clasificador ViT-B/16 afinado. No obstante, no hay cifras de rendimiento comparativo con alternativas concretas de clasificacion de residuos medicos, por lo que la comparativa cuantitativa se marca como no disponible.

## Limitaciones y advertencias

- Arquitectura de clasificacion de imagen completa: no genera bounding boxes ni localiza objetos, por lo que no sirve para deteccion o segmentacion.
- En escenas con multiples items, clasifica el especimen visualmente dominante, lo que puede producir errores en bandejas o contenedores con varios residuos mezclados.
- Solo etiquetas en ingles; no hay soporte multilingue documentado.
- Riesgo de alucinacion o clasificacion incorrecta en entradas no medicas: mitigado parcialmente por el umbral de rechazo (`Uncertain`), pero no eliminado.
- Sesgos conocidos: no documentados en la informacion disponible; al depender del dataset "Pharmaceutical-and-Biomedical-Waste", el rendimiento puede degradarse fuera de esa distribucion.
- La clase de indice 7 esta cuarentenada y no debe interpretarse como una categoria valida.
- La clasificacion de residuos medicos es sensible: el modelo no debe usarse como unico criterio en decisiones criticas de seguridad clinica o eliminacion de residuos sin supervision humana.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda verificar la procedencia y licencia del dataset y de la investigacion de referencia (Sivakumar et al.).
- Modelo con 0 descargas y 0 likes en el momento del registro: sin validacion por parte de la comunidad, lo que aconseja una evaluacion propia antes de produccion.

## Enlaces

- HuggingFace: https://huggingface.co/Venkat6789/MEDjestic-medical-waste-model
- Dataset referenciado: Pharmaceutical-and-Biomedical-Waste (disponible en HuggingFace, referencia citada en la model card)
- Investigacion de referencia: Sivakumar et al. (sin enlace disponible en la informacion proporcionada)
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada
