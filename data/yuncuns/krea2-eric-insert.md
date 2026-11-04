# yuncuns/krea2-eric-insert

## Resumen

Krea 2 Eric Insert es un adaptador LoRA para el modelo de difusion de imagenes Krea 2 Turbo, desarrollado por el usuario yuncuns (Eric). Su funcion es muy concreta: es un modelo de imagen a imagen (I2I) que inserta la identidad de una persona concreta (el propio autor) en una fotografia de entrada. No se trata de un modelo de lenguaje ni de un modelo fundacional, sino de un ajuste fino sobre un modelo base de generacion visual.

El modelo combina dos componentes: por un lado, el LoRA de personaje "er1cshen", entrenado con ai-toolkit sobre fotografias del autor, y por otro, el adaptador Krea 2 Identity Edit v1.2 del usuario conradlocke, fusionado sin modificaciones. El resultado es un adaptador que requiere el nodo ComfyUI-Krea2Edit para funcionar, lo que lo situa en el ecosistema de ComfyUI y no en pipelines de inferencia estandar de HuggingFace.

La relevancia de esta ficha es acotada: se trata de un artefacto de uso personal publicado en HuggingFace, con cero descargas y dos likes en el momento de la consulta. Su interes tecnico radica en documentar como se compone un LoRA de identidad sobre un modelo de difusion turbo y que dependencias de software implica, mas que en sus capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusion Krea 2 Turbo (no disponible el detalle interno) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | krea-2-community-license (Other) |
| Formato de pesos | no disponible (repo de 4.1 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Krea 2 Turbo, un modelo de difusion de imagenes de Krea. El componente propio es un LoRA de personaje entrenado con ai-toolkit, una herramienta de entrenamiento de difusion, usando fotografias del autor tomadas durante la epoca de la covid en las que lucia bigote completo. Sobre ese LoRA se fusiona, sin cambios, el adaptador Krea 2 Identity Edit v1.2 de conradlocke, que aporta la capacidad de edicion de identidad sobre la imagen de entrada.

No se dispone de informacion sobre el numero de imagenes de entrenamiento, el numero de pasos, la resolucion de entrenamiento, el rango del LoRA ni la composicion del dataset. Tampoco se documenta si hubo regularizacion, tecnicas de preservacion de identidad o estrategias de aumento de datos. La unica innovacion tecnica reseñable es la composicion de dos LoRA (identidad + edicion) sobre un modelo turbo, lo que sugiere un flujo de inferencia con pocos pasos, aunque el numero exacto de pasos no se especifica.

## Capacidades

- Edicion de imagen a imagen: recibe una fotografia y devuelve la misma escena con la identidad del autor insertada.
- Transferencia de identidad facial sobre una imagen de entrada, apoyada en el adaptador Identity Edit v1.2.
- Compatible con el ecosistema ComfyUI mediante el nodo ComfyUI-Krea2Edit.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues no aplicables (modelo de imagen).
- No dispone de modo thinking, vision por comprension ni audio.

## Casos de uso

- Prueba de concepto de edicion de identidad: insertar un rostro concreto en una fotografia existente para evaluar la calidad del LoRA de personaje antes de entrenar uno propio con ai-toolkit.
- Prototipado de flujos ComfyUI: servir como ejemplo funcional de composicion de dos LoRA (identidad y edicion) dentro de un grafo de nodos, util para quienes disenan pipelines de edicion de imagen.
- Investigacion sobre preservacion de identidad: comparar como se comporta un LoRA de personaje de bajo rango fusionado con un adaptador de edicion generico en terminos de fidelidad facial y coherencia de la escena.
- Documentacion de dependencias: caso de estudio de un adaptador que exige un nodo de terceros (ComfyUI-Krea2Edit) y una licencia de comunidad, relevante para quienes evaluan la portabilidad de LoRA publicados.
- Generacion de material personal: el autor lo usa para insertarse en fotografias propias, un caso de uso privado y no comercial.
- Reproducibilidad de entrenamientos: dado que se documenta la herramienta (ai-toolkit) y el dataset conceptual (fotos del autor), sirve como referencia para replicar el proceso con otro sujeto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo ocupa 4.1 GB, lo que sugiere pesos en precision media, pero no se especifica la VRAM necesaria para Krea 2 Turbo ni para el adaptador.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; depende de los requisitos de Krea 2 Turbo, que no se detallan en la informacion proporcionada.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-Krea2Edit (requisito explicito del autor). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Contexto / modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 Eric Insert | LoRA de identidad I2I | Krea 2 Turbo | Imagen a imagen | krea-2-community-license | HuggingFace, 0 descargas |
| Krea 2 Identity Edit v1.2 (conradlocke) | Adaptador de edicion de identidad | Krea 2 Turbo | Imagen a imagen | no disponible en la informacion | HuggingFace |
| Krea 2 Turbo (Krea) | Modelo de difusion base | — | Texto/imagen a imagen | krea-2-community-license | HuggingFace |

No se dispone de datos de rendimiento ni de parametros comparables para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Alcance extremadamente limitado: el propio autor indica que el modelo inserta "literalmente solo a mi", es decir, esta entrenado para una unica identidad y no generaliza a otras personas.
- Dependencia externa obligatoria: requiere el nodo ComfyUI-Krea2Edit, lo que limita su uso a ese entorno.
- Licencia de comunidad: la krea-2-community-license puede imponer restricciones al uso comercial; debe consultarse el PDF enlazado antes de cualquier despliegue productivo.
- No es un producto oficial de Krea: el autor lo declara explicitamente como version modificada no respaldada por Krea.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar artefactos faciales, inconsistencias de iluminacion o deformaciones en la imagen de salida.
- Sesgos: al entrenarse con fotografias de una sola persona, hereda los sesgos de ese dataset reducido (iluminacion, angulos, edad, etnia del sujeto).
- Sin datos de evaluacion: no hay benchmarks, metricas de fidelidad facial ni comparaciones publicadas.
- Madurez muy baja: cero descargas y dos likes en el momento de la consulta; no hay evidencia de uso en produccion.
- Idiomas no aplicables, pero la model card esta solo en ingles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuncuns/krea2-eric-insert
- Modelo base Krea 2 Turbo: https://huggingface.co/krea/Krea-2-Turbo
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- PDF de licencia: https://huggingface.co/yuncuns/krea2-eric-insert/blob/main/LICENSE.pdf
- Adaptador Krea 2 Identity Edit v1.2: https://huggingface.co/conradlocke/krea2-identity-edit
- Nodo ComfyUI-Krea2Edit: https://github.com/lbouaraba/comfyui-krea2edit
- Herramienta de entrenamiento ai-toolkit: https://github.com/ostris/ai-toolkit
