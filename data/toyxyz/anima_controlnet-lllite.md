# toyxyz/Anima_ControlNet-LLLite

## Resumen

Anima ControlNet-LLLite es un conjunto de dos adaptadores ControlNet ligeros (formato LLLite v2) desarrollados por el usuario toyxyz para el modelo de difusion de imagenes Anima Base 1.0, publicado por circlestone-labs. No es un modelo autonomo: son pesos adicionales que se acoplan sobre `anima-base-v1.0.safetensors` para condicionar la generacion mediante mapas de control espacial. Se distribuyen dos archivos, `anima_regional_4335.safetensors` (control de region RGB por colores de instancia) y `anima_3dpose_6200.safetensors` (control de pose a partir de mallas corporales 3D sombreadas).

El problema que resuelven es el control fino de la composicion: en lugar de limitarse a un prompt de texto, permiten definir que regiones de la imagen ocupa cada sujeto u objeto y forzar la postura del cuerpo, dedos incluidos. Esto resulta relevante para ilustracion digital y generacion controlada de escenas, donde la colocacion y la pose son requisitos estrictos. Para escenas con varias personas, los dos adaptadores pueden combinarse para separar y situar cada personaje de forma mas estable.

Los adaptadores estan entrenados especificamente sobre Anima Base 1.0 y emplean el formato Anima LLLite v2. El repositorio ocupa aproximadamente 0,1 GB, lo que confirma que son pesos compactos en lugar de un modelo completo. La documentacion del autor advierte que la combinacion de ambos adaptadores no se ha evaluado cuantitativamente en esta version.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes adaptadoras ControlNet-LLLite (formato v2) sobre el modelo de difusion Anima Base 1.0 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de difusion de imagenes, no un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | other (upstream-anima-and-source-data-terms) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,1 GB |
| Modelo base | circlestone-labs/Anima (anima-base-v1.0.safetensors) |
| Pipeline | image-to-image |

## Arquitectura y entrenamiento

Los adaptadores siguen el esquema ControlNet-LLLite en su version 2, un mecanismo de inyeccion de condicionamiento ligero que actua sobre un modelo de difusion congelado. En lugar de duplicar el codificador del modelo base como un ControlNet clasico, LLLite anade modulos de bajo coste computacional, lo que explica el reducido tamano del repositorio (0,1 GB). El modelo base es Anima Base 1.0, un modelo de difusion de imagenes; los adaptadores no funcionan sin el.

Los datos de entrenamiento son dos conjuntos publicados por el propio autor: `toyxyz/booruregion_10k` (para el adaptador regional) y `toyxyz/booru3dpose_10k` (para el adaptador de pose). El adaptador de pose `anima_3dpose_6200` completo 6.200 actualizaciones, resultado de 4.335 mas 1.865 actualizaciones con reanudacion de estado completo. El adaptador regional `anima_regional_4335` se entreno en 4.335 pasos. No se especifican en la informacion disponible el numero total de tokens o imagenes, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO. El ejemplo de flujo de trabajo usa 30 pasos de muestreo, CFG 4 y strength 1.0.

## Capacidades

- Control de region RGB: usa un mapa de color de instancia de 3 canales donde colores solidos distintos identifican regiones y el negro marca los pixeles sin asignar; los colores no son etiquetas semanticas fijas.
- Control de pose 3D: guia la postura y la distribucion corporal a partir de mallas corporales 3D sombreadas y coloreadas sobre fondo negro, incluyendo los dedos.
- Combinacion de pose 3D y control regional: permite separar y situar a varios personajes en escenas multipersona combinando ambos adaptadores.
- Condicionamiento espacial de siluetas y colocacion de objetos mediante el adaptador regional.
- Integracion con ComfyUI: se distribuyen flujos de trabajo de ejemplo en JSON (regional, pose 3D y avanzado).
- Compatibilidad con el nodo ComfyUI-Anima-LLLite y con ComfyUI_toyxyz_test_nodes (editor de pose 3D, ComfyCouple Region painter y ComfyCouple Mask).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling ni capacidades de agente; es un componente de condicionamiento visual.

## Casos de uso

- Ilustracion con control de composicion: asignar a cada sujeto u objeto una region de color concreta en el mapa RGB para fijar su lugar en el lienzo, util cuando el prompt de texto no basta para garantizar el encuadre.
- Posing preciso de personajes: usar mallas 3D sombreadas como condicion para reproducir una postura concreta, incluida la posicion de los dedos, en la generacion de ilustraciones.
- Escenas con varias personas: combinar los adaptadores de pose 3D y regional para mantener separados y bien situados a distintos personajes, con prompts por persona.
- Blocking y previsualizacion de escenas: generar bocetos controlados a partir de mapas de regiones antes de producir el render final.
- Refinado por regiones: ampliar o ajustar la mascara de una persona con ComfyCouple Region painter para cubrir la ropa mas alla de la silueta corporal y corregir el encuadre.
- Ajuste de influencia por fase de muestreo: reducir el `end_percent` del adaptador regional (el ejemplo usa 0,3) para que su efecto termine antes en el muestreo, mientras el adaptador de pose mantiene `end_percent = 1.0`.
- Investigacion sobre condicionamiento espacial: estudiar como interactuan dos senales de control (pose y region) sobre un mismo modelo de difusion congelado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los adaptadores son ligeros (repositorio de 0,1 GB), pero requieren cargar el modelo base Anima Base 1.0, su codificador de texto y su VAE; la VRAM depende por completo de ese modelo base, cuyo requisito no se especifica en la informacion disponible.
- GPU recomendadas: no disponible en la informacion proporcionada; al ser adaptadores sobre un modelo de difusion de imagenes, se aplican los requisitos del modelo base Anima.
- Encaje en GPU de consumo: no disponible; condicionado por el modelo base.
- Opciones de despliegue: ComfyUI es el entorno documentado, con el nodo ComfyUI-Anima-LLLite y los flujos de trabajo de ejemplo incluidos en el repositorio.
- Latencia y throughput: no disponibles.
- Ajustes de inferencia documentados en los ejemplos: 30 pasos de muestreo, CFG 4, strength 1.0; `end_percent` 0,3 para el adaptador regional y 1,0 para el de pose, con `preserve_wrapper = true` en ambos para poder combinarlos.

## Comparativa con modelos similares

No se dispone, en la informacion proporcionada, de datos cuantitativos de modelos externos comparables. A continuacion se comparan los dos adaptadores que componen este repositorio, que son la unica alternativa documentada dentro del propio paquete:

| Adaptador | Tipo de control | Pasos de entrenamiento | Entrada |
|---|---|---|---|
| anima_regional_4335.safetensors | Region RGB de instancia (disposicion de sujetos, siluetas, poses y colocacion de objetos) | 4.335 | Mapa de color de instancia de 3 canales |
| anima_3dpose_6200.safetensors | Pose 3D de mallas corporales sombreadas, con dedos | 6.200 (4.335 + 1.865 con reanudacion de estado completo) | Malla corporal 3D coloreada y sombreada sobre negro |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere Anima Base 1.0, su codificador de texto y su VAE para funcionar.
- El adaptador regional no es un modelo de inpainting de mascara blanco y negro; trabaja con un mapa de color de instancia donde los colores no son etiquetas semanticas fijas.
- La exactitud de pose y de manos puede variar, segun advierte el propio autor.
- La combinacion de los adaptadores de pose 3D y regional no se ha evaluado cuantitativamente en esta version.
- Idiomas: solo ingles en la documentacion y los prompts; no se declara soporte multilingue.
- Licencia "other" bajo los terminos upstream-anima-and-source-data-terms; el uso comercial queda supeditado a la licencia de Anima Base 1.0 y a los terminos de los datos de origen. Consulte el archivo de licencia enlazado antes de cualquier uso en produccion.
- Riesgo de alucinacion: propio de los modelos de difusion de imagenes; la condicion espacial reduce la variabilidad de composicion, pero no garantiza resultados fieles al control en todos los casos.
- Sin resultados de benchmarks publicados ni metricas cuantitativas de calidad en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/toyxyz/Anima_ControlNet-LLLite
- Modelo base Anima: https://huggingface.co/circlestone-labs/Anima
- Archivo del modelo base: https://huggingface.co/circlestone-labs/Anima/blob/main/split_files/diffusion_models/anima-base-v1.0.safetensors
- Licencia del modelo base: https://huggingface.co/circlestone-labs/Anima/blob/main/LICENSE.md
- Dataset regional: https://huggingface.co/datasets/toyxyz/booruregion_10k
- Dataset de pose 3D: https://huggingface.co/datasets/toyxyz/booru3dpose_10k
- Nodo ComfyUI LLLite para Anima: https://github.com/kohya-ss/ComfyUI-Anima-LLLite
- Nodos de prueba del autor: https://github.com/toyxyz/ComfyUI_toyxyz_test_nodes
