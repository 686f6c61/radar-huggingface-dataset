# zhuhz22/vbench-models

## Resumen

`zhuhz22/vbench-models` no es un modelo generativo, sino un repositorio de artefactos de evaluación para la benchmark VBench aplicada a generación de vídeo de larga duración. Contiene los pesos preentrenados que la cadena de evaluación de VBench necesita (ViCLIP, MUSIQ/pyiqa y RAFT) junto con 200 vídeos de referencia ya generados (100 por cada método, RIFLEx y YaRN) que permiten reproducir los resultados de tres métricas concretas sin tener que regenerar los vídeos.

El repositorio está pensado como complemento de un repositorio de código privado denominado `code_real_for_0703`, cuyos scripts usan rutas relativas (`pretrained/...`, `eval/RIFLEx`, `eval/YaRN`), por lo que los directorios deben colocarse en la raíz de ese código. El tamaño total del repo es de 2,1 GB, repartido en 7 ficheros de pesos (~1,78 GiB) y 200 vídeos MP4 (~222 MiB).

No se trata, por tanto, de un modelo al que se le puedan pedir especificaciones de arquitectura, contexto o licencia en el sentido habitual: es un paquete de activos de evaluación. Los pesos incluidos son de terceros (ViCLIP de InternVid, MUSIQ de pyiqa y RAFT), y la model card no declara licencia ni idiomas para el conjunto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (conjunto de artefactos: ViCLIP, MUSIQ/pyiqa, RAFT y vídeos MP4; no es un modelo único) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch) para ViCLIP, MUSIQ y RAFT; `.mp4` para los vídeos de evaluación |

## Arquitectura y entrenamiento

El repositorio agrupa tres componentes de evaluación independientes. `pretrained/ViCLIP/ViClip-InternVid-10M-FLT.pth` es el codificador vídeo-texto ViCLIP entrenado sobre el corpus InternVid-10M (variante FLT), usado por VBench para métricas de alineación semántica entre prompt y vídeo. `pretrained/pyiqa_model/musiq_spaq_ckpt-358bb6af.pth` es el modelo MUSIQ de la librería pyiqa, empleado para evaluar calidad visual sin referencia. `pretrained/raft_model/models/` contiene cinco checkpoints de RAFT (chairs, kitti, sintel, small y things), usados para estimación de flujo óptico en métricas de movimiento.

El segundo bloque, `eval/`, contiene 200 vídeos MP4 ya generados: 100 bajo el método RIFLEx y 100 bajo YaRN. Estos vídeos son la entrada directa de la fase de evaluación de métricas, de modo que pueden reproducirse los resultados sin volver a ejecutar los scripts de generación. La model card advierte de que, si se relanza la generación, los scripts sobrescriben los ficheros de `eval/RIFLEx` y `eval/YaRN`. Adicionalmente, VBench descarga por su cuenta otros pesos (AMT, tag2text) mediante `wget` la primera vez que se ejecutan ciertas métricas como `motion_smoothness` u `object_class`.

## Capacidades

- Almacenar y servir los pesos necesarios para ejecutar las métricas de VBench que dependen de ViCLIP, MUSIQ y RAFT.
- Proporcionar 100 vídeos de referencia por método (RIFLEx y YaRN) para reproducir la evaluación sin regenerar.
- Permitir la verificación de integridad de la descarga mediante conteo de ficheros y suma de bytes (7 ficheros y 1.907.573.609 B en `pretrained/`; 200 ficheros y 233.087.431 B en `eval/`).
- Soportar dos vías de descarga: `hf download` con `--include` para traer solo `pretrained/*` y `eval/*`, o `git clone` con Git LFS.
- No ofrece generación de texto, código, matemáticas, visión general, tool calling, agentes ni capacidades multilingües: es un paquete de evaluación.

## Casos de uso

- Reproducción de resultados de un paper o informe técnico sobre generación de vídeo largo: colocando `pretrained/` y `eval/` en la raíz de `code_real_for_0703` y lanzando la fase de evaluación de métricas, se obtienen las puntuaciones VBench sobre exactamente los mismos 200 vídeos, lo que permite comparar de forma controlada RIFLEx frente a YaRN.
- Comparación de métodos de extrapolación temporal: los 100 vídeos por método permiten medir diferencias en métricas de calidad visual (MUSIQ), alineación texto-vídeo (ViCLIP) y coherencia de movimiento (RAFT) sin sesgo por regeneración.
- Validación de pipelines de evaluación en CI: los conteos de ficheros y las sumas de bytes documentados permiten escribir comprobaciones automáticas que detecten descargas incompletas o punteros LFS sin resolver.
- Preparación de entornos sin acceso directo a Hugging Face: la model card documenta el uso de proxy (`http_proxy`/`https_proxy`) y la instalación manual de `git-lfs` en `~/.local/bin` sin privilegios de root, útil en clústeres restringidos.
- Réplica de evaluaciones en entornos aislados: al ser artefactos estáticos, pueden copiarse a un sistema sin red y ejecutar la evaluación íntegramente en local, salvo las descargas adicionales de AMT y tag2text que VBench hace por `wget`.
- Auditoría de resultados publicados: al disponer de los vídeos originales, un tercero puede recalcular las métricas y contrastar las cifras reportadas por los autores del método evaluado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye puntuaciones numéricas de VBench para RIFLEx ni YaRN, solo la infraestructura y los vídeos necesarios para calcularlas.

## Requisitos de hardware

- Almacenamiento: 2,1 GB para el repositorio completo (1.907.573.609 B en `pretrained/` y 233.087.431 B en `eval/`). Se recomienda margen adicional para los pesos que VBench descarga aparte (AMT, tag2text).
- VRAM: no disponible en la información proporcionada. Depende de los requisitos de ViCLIP, MUSIQ y RAFT al ejecutar la evaluación, no del repositorio en sí.
- GPU recomendadas: no disponible. No se especifica en la model card.
- Ejecución en GPU de consumo: no disponible; no hay datos que permitan confirmarlo ni descartarlo.
- Opciones de despliegue: no aplica como servidor de inferencia. La descarga se realiza con `hf download` (recomendado, con `--include "pretrained/*" --include "eval/*"` y `--local-dir .`) o con `git clone` más Git LFS 3.5.1 o superior.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada repositorios comparables de artefactos de evaluación para VBench, ni se dispone de datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para generar texto, vídeo, código ni responder consultas. Cualquier expectativa de inferencia directa es un error de interpretación.
- La licencia no está declarada. Antes de un uso comercial o de redistribución hay que verificar por separado las licencias de ViCLIP (InternVid), MUSIQ (pyiqa) y RAFT, que son componentes de terceros.
- Los scripts de generación sobrescriben los vídeos de `eval/RIFLEx` y `eval/YaRN`; si se relanza la generación se pierden los 200 vídeos de referencia incluidos.
- Las rutas son relativas y rígidas: `pretrained/` y `eval/` deben estar en la raíz de `code_real_for_0703`. Si ya existen esos directorios, `mv` anida las carpetas en lugar de sustituirlas; hay que respaldar y borrar antes.
- Con `git clone` sin Git LFS instalado, los `.pth` y `.mp4` se descargan como punteros de pocos bytes y la evaluación fallará silenciosamente o con errores poco informativos. Conviene ejecutar `git lfs fsck` tras el clonado.
- VBench descarga pesos adicionales (AMT, tag2text) por `wget` en la primera ejecución de ciertas métricas; en entornos sin salida a Internet la evaluación se interrumpirá aunque el repositorio esté completo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en noviembre de 2026; no hay historial de uso que permita avalar su estabilidad.
- La model card está redactada en chino y no documenta sesgos, tasas de alucinación ni limitaciones de los modelos subyacentes.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zhuhz22/vbench-models
- VBench (benchmark de generación de vídeo): no disponible en la información proporcionada
- ViCLIP / InternVid: no disponible en la información proporcionada
- pyiqa (MUSIQ): no disponible en la información proporcionada
- RAFT (flujo óptico): no disponible en la información proporcionada
- Git LFS v3.5.1 (usado en las instrucciones de instalación): https://github.com/git-lfs/git-lfs/releases/download/v3.5.1/git-lfs-linux-amd64-v3.5.1.tar.gz
