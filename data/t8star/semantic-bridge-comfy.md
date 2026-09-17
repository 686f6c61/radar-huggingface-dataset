# t8star/Semantic-Bridge-Comfy

## Resumen

Semantic-Bridge-Comfy es un repositorio de adaptadores de condicionamiento para MiniMax H3, empaquetados por el usuario t8star bajo el formato que denomina T8 Compat. No es un modelo de lenguaje ni un modelo de difusion: son dos ficheros de seis tensores que actuan como puente semantico sobre el `CONDITIONING` nativo de MiniMax H3 (tensor sin proyectar de forma `[B,T,5120]`), pensados para ser leidos por nodos de ComfyUI que implementan Semantic Bridge. El modelo base declarado es `MiniMaxAI/MiniMax-H3` y el repositorio no incluye pesos del modelo principal, CLIP, VAE ni LoRA.

Los dos adaptadores provienen de autores distintos y no son versiones uno del otro. `MiniMaxH3_SemanticBridge_v1_T8_Compat.safetensors` (10,51 MiB, FP16) procede de speach1sdef178 y apunta a semantica general, composicion, relaciones espaciales, cantidad, materiales, reflejos y oclusiones. `BUNNY_H3_ActionLogic_Bridge_V1_T8_Compat.safetensors` (21,03 MiB, FP32) procede de FourBunny / JOKER141 y apunta a logica de accion, continuidad de movimiento y atribucion de objetos. Ambos se activan con un parametro `alpha` cuya intensidad de partida recomendada es 0,10.

El interes actual del repositorio es de tipo integracion: ofrece una via de instalacion reproducible en la estructura de directorios de ComfyUI (`models/semantic_bridge/t8_compat/`), conserva nombre, shape, dtype y valores de los seis tensores originales y solo anade metadatos de procedencia y verificacion. El autor mantiene el estado como experimental (EXP) y advierte explicitamente de que quiza no este disponible la version de nodos necesaria en la build publicada de su custom node, por lo que la utilidad practica depende de disponer de una version del nodo que exponga los ID `MiniMaxH3SemanticBridgeConfigT8` y `MiniMaxH3SemanticBridgeApplyT8`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de condicionamiento de seis tensores sobre el `CONDITIONING` nativo de MiniMax H3; no es un transformer, MoE ni SSM. Modifica condicionamiento no proyectado `[B,T,5120]`; no recibe entrada `MODEL` |
| Parametros totales | No disponible como recuento de parametros. El autor solo declara la estructura de seis tensores y los tamanos de fichero: 11.024.432 bytes (aprox. 10,51 MiB) y 22.046.928 bytes (aprox. 21,03 MiB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El adaptador opera sobre la dimension `T` del condicionamiento nativo y usa `chunk_tokens=256` como limite de espacio de trabajo temporal, lo que no equivale a una ventana de contexto |
| Tipos de cuantizacion | No disponible / no se aplica: no hay versiones cuantizadas. Los pesos se conservan en las precisiones originales FP16 y FP32; el autor indica que no se ha reentrenado, cuantizado a INT8 ni cambiado la precision de los pesos. El calculo interno del adaptador T8 es FP32 y la salida recupera dtype y device del `CONDITIONING` original |
| Idiomas soportados | zh, en (declarados en los metadatos del repositorio) |
| Licencia | `minimax-h3-community-license-agreement` (etiqueta `license: other`); enlace de licencia en el repositorio de MiniMax H3 |
| Formato de pesos | `safetensors` (dos ficheros, mas `LICENSE.txt` y `NOTICE.txt` en el directorio de instalacion) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: publica una conversion de empaquetado. Los pesos originales proceden de `speach1sdef178/MiniMax-H3-Semantic-Bridge`, fijado en la revision `b9fe58ba6f428d990a59f20f09f719c8fbc67f7d`, y de un segundo entrenamiento independiente de FourBunny / JOKER141 (`BUNNY_H3_ActionLogic_Bridge_V1`). El proceso T8 Compat conserva los seis tensores originales con sus nombres, shapes, dtypes y valores, y anade metadatos de origen, verificacion por tensor y sumas de comprobacion. La consecuencia es que el SHA256 del fichero cambia, pero no hay reentrenamiento, cuantizacion ni cambio de precision.

Aunque el fichero de la primera variante este almacenado en FP16, el autor especifica que la aritmetica interna del adaptador T8 se ejecuta en FP32 y que la salida restaura el dtype y el device del `CONDITIONING` de entrada. El adaptador ofrece tres modos de ajuste de magnitud (`per_token`, `global`, `none`, siendo `per_token` el valor de partida) y dos alcances de token (`all_tokens`, la configuracion matematica original, y `text_only_preserve_reference`, que solo modifica las filas de texto con `tag=1` y es experimental). No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en los entrenamientos originales.

En cuanto a verificacion, el autor declara haber repetido comprobaciones en CPU antes de publicar: coincidencia tensor a tensor de dtype, shape y hash de contenido con el fichero fuente en ambos modelos, ausencia de NaN/Inf, y salida identica byte a byte entre fichero original y encapsulado en los tres modos de magnitud bajo la misma configuracion. Se mencionan tambien 443 regresiones de CPU afectadas, cinco validaciones de flujos Core reales y una verificacion mecanica de 8 segundos con doble `MODEL` y Relay. Estas cifras son controles de conversion y de integracion, no evaluaciones de calidad.

## Capacidades

- Modificacion de condicionamiento semantico para MiniMax H3 en ComfyUI: aplica el puente sobre el `CONDITIONING` nativo sin tocar el modelo principal, el CLIP ni el VAE.
- Refuerzo de semantica general y composicion (variante `MiniMaxH3_SemanticBridge_v1`): relaciones espaciales, cantidades, materiales, reflejos y oclusiones, segun la descripcion del autor original.
- Refuerzo de logica de accion y continuidad de movimiento (variante `BUNNY_H3_ActionLogic_Bridge_V1`): movimiento continuo y atribucion de objetos.
- Bypass completo mediante `enabled=false` o `alpha=0`, util para generar lineas base comparables sin desinstalar nada.
- Ajuste fino del efecto mediante `alpha` (0,10 como valor de partida), `magnitude_match` y `token_scope`.
- Integracion con Prompt Relay: se conecta al puerto interno `semantic_bridge` del nodo de condiciones Relay en lugar de encadenar un Apply adicional.
- Integracion con bucles internos de video largo, incluida la variante de doble modelo con `semantic_bridge_pass1` y `semantic_bridge_pass2` (candidata de desarrollo).
- Diagnostico mediante `report_json`: origen, identidad del modelo, entradas, salidas y numero de aplicaciones. No es una puntuacion de calidad de imagen.
- Generacion de texto, razonamiento, codigo, matematicas, vision, audio nativo, tool calling y uso como agente: no aplica a este repositorio, que solo contiene adaptadores de condicionamiento (no disponible en la informacion proporcionada para cualquier capacidad generativa propia).

## Casos de uso

- Generacion de video texto-a-video con MiniMax H3 en ComfyUI: insertar el Bridge entre la codificacion nativa de H3 y el guider o sampler para intentar mejorar composicion y coherencia semantica sin sustituir el modelo base.
- Escenas de accion y movimiento continuo: usar exclusivamente `BUNNY_H3_ActionLogic_Bridge_V1` para trabajar continuidad de movimiento y atribucion de objetos, comparando contra la variante v1 y contra la linea base sin Bridge.
- Evaluacion A/B reproducible en produccion: fijar codificador nativo, seed, prompt, modelo base, LoRA, resolucion y receta de muestreo, y generar tres salidas (sin Bridge, v1, BUNNY) para atribuir cambios al adaptador y no a otros componentes.
- Flujos con Prompt Relay y lineas temporales: conectar el Bridge al puerto interno del nodo Relay para aplicar el efecto sobre el condicionamiento ya planificado, manteniendo la planificacion global y local de prompts.
- Video largo con bucle interno o doble modelo: enganchar la configuracion Bridge al puerto del nodo de video largo, o usar `semantic_bridge_pass1` / `semantic_bridge_pass2` para activar o desactivar el efecto por etapa, regenerando el `chain_id` cuando cambie la receta.
- Pipelines de audio y canto en H3 (Ref2VA, audio de referencia, canto, Hybrid): probar el adaptador sabiendo que estas rutas siguen marcadas como EXP y que el autor reporta degradaciones de pronunciacion y sincronizacion labial en el modelo subyacente.
- Regresion automatizada de integraciones ComfyUI: reutilizar la verificacion de seis tensores, hashes y salidas byte a byte como prueba de que un empaquetado nuevo no altera la matematica del adaptador original.
- Despliegue en maquinas con varios discos o granjas de modelos: ubicar los ficheros via `extra_model_paths.yaml` bajo una clave `semantic_bridge`, manteniendo la subcarpeta `t8_compat/` para que los flujos guardados no pierdan la seleccion de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay MMLU, HumanEval, GSM8K ni metricas de calidad de video, imagen o audio en la model card. Los unicos datos numericos aportados son de verificacion de conversion e integracion:

| Comprobacion | Resultado declarado |
|---|---|
| Coincidencia tensor a tensor (dtype, shape, hash de contenido) con el fichero fuente | Conforme en los dos modelos, sin NaN/Inf |
| Salida original frente a encapsulada en `per_token`, `global` y `none` | Identica byte a byte bajo la misma configuracion |
| Regresiones de CPU del alcance afectado | 443 elementos |
| Validacion de flujos Core reales | 5 flujos |
| Verificacion mecanica con doble `MODEL` y Relay | Dos tramos, 8 segundos en total |
| Revision humana de imagen concentrada, dialogo, canto y costura | Pendiente en la fecha del aviso (2026-09-17) |
| Diagnostico ampliado de todo el repositorio | No completado; la linea base ya tenia fallos y el autor rechaza declararlo en verde |

## Requisitos de hardware

- VRAM para el adaptador: marginal frente al modelo base. Los ficheros ocupan 10,51 MiB (FP16) y 21,03 MiB (FP32), y el calculo interno se hace en FP32, por lo que la huella adicional es de unos pocos megabytes mas el espacio de trabajo limitado por `chunk_tokens=256`.
- VRAM total: la determina MiniMax H3 y el resto del grafo de ComfyUI. El autor no promete 16 GB de residencia permanente, ni aceleracion, ni reduccion de VRAM.
- GPU recomendadas: no disponible. No se publican recomendaciones de GPU ni requisitos minimos para este repositorio.
- GPU de consumo: no confirmado por el autor. El adaptador en si no exige GPU; funciona con `device=auto` (sigue al tensor de condicionamiento) y admite `cpu` o `cuda` como sobrescritura avanzada, que no descarga otros modelos de memoria.
- Opciones de despliegue: ComfyUI con los nodos del proyecto T8 (`MiniMaxH3SemanticBridgeConfigT8` y `MiniMaxH3SemanticBridgeApplyT8`), descarga mediante `hf download t8star/Semantic-Bridge-Comfy --include "models/semantic_bridge/t8_compat/*" --local-dir .` desde la raiz de ComfyUI, y rutas adicionales via `extra_model_paths.yaml`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponible. Solo se declara una verificacion mecanica de dos tramos de 8 segundos, que no equivale a una medicion de rendimiento.
- Nota de disponibilidad: el autor indica que el codigo de nodo nuevo no se habia publicado en GitHub ni en el Registry en la fecha del aviso, por lo que la version v1.83.0 publicada podria no incluir los nodos necesarios.

## Comparativa con modelos similares

No se han identificado en la informacion disponible adaptadores de puente semantico de terceros comparables para MiniMax H3. La comparacion factible es interna al repositorio:

| Artefacto | Autor original | Precision de almacenamiento | Tamano | Ambito declarado | Estado |
|---|---|---|---|---|---|
| MiniMaxH3_SemanticBridge_v1_T8_Compat.safetensors | speach1sdef178 (revision b9fe58ba) | FP16 | 11.024.432 bytes (aprox. 10,51 MiB) | Semantica general, composicion, relaciones espaciales, cantidad, materiales, reflejos, oclusion | Publicado; efecto no garantizado para todo prompt |
| BUNNY_H3_ActionLogic_Bridge_V1_T8_Compat.safetensors | FourBunny / JOKER141 | FP32 | 22.046.928 bytes (aprox. 21,03 MiB) | Logica de accion, continuidad de movimiento, atribucion de objetos | Publicado; entrenamiento independiente, no derivado del anterior |
| Linea base sin Bridge | No aplica | No aplica | No aplica | Condicionamiento nativo de H3 sin modificar | Referencia obligatoria de comparacion (`enabled=false` o `alpha=0`) |

Frente a otras alternativas de la misma categoria (LoRA, text encoders, upscalers, modelos de aceleracion), el propio autor indica que este artefacto no es ninguna de ellas y no las sustituye. No se dispone de comparativas de rendimiento frente a LoRA o adaptadores alternativos.

## Limitaciones y advertencias

- No es un modelo autonomo: no genera texto ni imagenes por si mismo y no sustituye al modelo principal de H3, a CLIP ni al VAE.
- Estado experimental: Ref2VA, audio de referencia, canto, Hybrid, continuacion e bucle interno siguen marcados como EXP.
- Degradacion documentada por el upstream: el autor del repositorio reporta problemas de pronunciacion y sincronizacion labial en audio de referencia y canto. La compatibilidad de cableado de T8 y las comprobaciones mecanicas no eliminan ese riesgo; no se debe validar la voz generada usando como prueba que la pista de referencia original suene bien.
- Revision humana pendiente: en la fecha del aviso (2026-09-17) faltaba la revision humana de imagen concentrada, dialogo generado, canto y costuras del segundo tramo.
- Efecto no garantizado: no se asegura que los prompts sean mas precisos, ni que cualquier flujo funcione sin degradacion. Subir `alpha` no mejora necesariamente el resultado y no debe usarse para tapar fallos de voz, identidad o accion.
- Riesgo de doble aplicacion: aplicar el adaptador dos veces sobre el mismo `CONDITIONING`, o encadenar un Apply despues de un Relay ya vinculado, produce resultados incorrectos. La solucion indicada es eliminar el Apply sobrante y recodificar desde el condicionamiento nativo.
- Restricciones de combinacion: las dos variantes no deben encadenarse sobre la misma entrada; son entrenamientos independientes.
- Compatibilidad de distribucion: el adaptador modifica el condicionamiento nativo no proyectado de H3. Otros codificadores con la misma dimensionalidad no quedan cubiertos por esa garantia.
- Limitacion idiomatica: los metadatos declaran solo zh y en.
- Licencia: `minimax-h3-community-license-agreement`, con etiqueta `other`. Es imprescindible revisar el texto completo antes de cualquier uso comercial; la informacion disponible no detalla los terminos concretos de explotacion.
- Trazabilidad de versiones: el nodo que expone los puertos necesarios podria no estar en la build publicada (v1.83.0), y descargar los pesos no anade nodos por si mismo.
- Integridad: el empaquetado T8 cambia el SHA256 respecto al fichero original. Si un flujo o politica interna verifica hashes del upstream, habra que registrar los nuevos valores.
- Enlaces con parametros de promocion: varias URLs de la model card (API y aplicacion web) incluyen parametros de afiliacion o invitacion, tal y como reconoce el propio autor.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo para estos adaptadores ni para el modelo base en la informacion proporcionada.
- Riesgo de alucinacion: no aplica en el sentido habitual de generacion de texto; el riesgo equivalente es la aplicacion de un efecto semantico no deseado sin que el resultado lo refleje de forma evidente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/t8star/Semantic-Bridge-Comfy
- Perfil del autor en HuggingFace: https://huggingface.co/t8star
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Adaptador original de speach1sdef178: https://huggingface.co/speach1sdef178/MiniMax-H3-Semantic-Bridge/tree/b9fe58ba6f428d990a59f20f09f719c8fbc67f7d
- Revision fijada: `b9fe58ba6f428d990a59f20f09f719c8fbc67f7d`
- Proyecto de nodos para ComfyUI: https://github.com/T8mars/comfyui-minimax-h3-audio-T8
- Manifiesto de modelos y verificacion: `MODEL_MANIFEST.json` (incluido en el repositorio)
- Bilibili del autor: https://space.bilibili.com/385085361
- YouTube del autor: https://www.youtube.com/@T8star-Aix/
- API (con parametro de afiliacion): https://api.seedance.nz/sign-up?aff=5f4w
- Aplicacion web (con codigo de invitacion): https://www.runninghub.ai/zh-cn/user-center/1907375370302308353/userPost?inviteCode=rh-v1121
- Paquete integrado de ComfyUI: https://pan.quark.cn/s/264edb7e36bd
- Repositorio de modelos en la nube: https://pan.quark.cn/s/c9c267081fbf
- Resultados de busqueda web: no se ha recuperado ningun resultado relevante sobre este modelo; las busquedas devolvieron paginas de ayuda de YouTube y Chrome, una noticia sobre Halo: Combat Evolved y un fichero de imagen sin relacion.
