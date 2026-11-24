# Youzzevic/trust-wallet-metamask-seed-recovery

## Resumen

El repositorio `Youzzevic/trust-wallet-metamask-seed-recovery` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuible para Windows x64 (etiquetado como portable) que la model card presenta como una herramienta de "recuperación de semillas" de monederos Trust Wallet y MetaMask, con módulos que describen exportación de saldos, resolución parcial de mnemónicos, derivación multi-cadena y validación BIP39 local. No hay pesos, tokenizador, configuración de arquitectura ni pipeline declarados en la información disponible.

Es relevante ahora no por su valor técnico como modelo, sino como caso de riesgo: el patrón descrito (archivo ZIP con contraseña, ejecutable que requiere permisos de administrador, petición de desactivar avisos de Windows Defender, distribución vía un repositorio de GitHub ajeno al autor declarado y temática de recuperación de frases semilla) coincide con la estructura típica de una campaña de malware orientada al robo de criptomonedas. Un modelo o herramienta que solicite una frase semilla de 12/24 palabras para "recuperarla" tiene capacidad de vaciar cualquier monedero cuyas claves maneje.

Por tanto, esta ficha documenta el artefacto tal y como se describe en su model card, sin validar ninguna de sus afirmaciones, y advierte de que no debe ejecutarse en ningún sistema con acceso a claves privadas o fondos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; se describe como aplicación nativa x64 para Windows) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni un pipeline de inferencia. La model card describe un binario `trust-wallet-metamask-seed-recovery-v1.2.0-win64.exe` (build declarada `v4.2.6 (2EDA6D)`, ZIP de 8,9 MB) con módulos que mencionan SIMD multi-hilo, hashing PBKDF2, derivación BIP44/BIP84 sobre EVM, Solana y Bitcoin, validación BIP39 offline de 12/18/24 palabras y rotación de nodos RPC (Alchemy, Helius, QuickNode). Son afirmaciones de marketing sin evidencia verificable: no hay código fuente, hashes de integridad, firma de código ni trazabilidad de build publicados en la información proporcionada.

No existe información sobre datos de entrenamiento, RLHF, DPO ni innovaciones de modelado, porque no hay modelo. Cualquier afirmación sobre "precisión del 98,8 %" o "96,5 % de consistencia" en la model card carece de metodología reproducible y debe tratarse como no verificada.

## Capacidades

- Ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión: no es un modelo de lenguaje.
- La model card declara, sin verificación, funciones de exportación de saldos, reconstrucción de mnemónicos parciales, derivación de direcciones multi-cadena y validación BIP39.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo etiquetas de idioma en el repositorio, sin funcionalidad documentada asociada.
- Capacidad especial declarada: "recuperación de semillas" de monederos, función que en la práctica implica acceso a material secreto y que ningún proveedor legítimo de monederos solicita.

## Casos de uso

- Ninguno recomendado. No se debe desplegar este artefacto en entornos de desarrollo, investigación ni producción.
- Auditoría de seguridad defensiva: analizar el binario en una máquina virtual aislada y sin red para documentar indicadores de compromiso (IOC) y alimentar reglas de detección en el EDR corporativo.
- Formación en concienciación: usar la model card como ejemplo real de ingeniería social dirigida a titulares de criptomonedas, señalando las banderas rojas (ZIP con contraseña, petición de ejecutar como administrador, instrucción de desactivar SmartScreen).
- Investigación de fraude: comparar el patrón de distribución (repositorio de GitHub de terceros, badges falsos de descargas y valoraciones, enlaces a `releases/latest`) con campañas documentadas de malware tipo infostealer.
- Respuesta a incidentes: si un usuario ya lo ejecutó, el caso de uso es la contención inmediata (aislar el equipo, rotar todas las semillas y claves privadas desde un dispositivo limpio, revisar movimientos on-chain).
- Denuncia y retirada: reportar el repositorio a Hugging Face y al propietario del repositorio de GitHub referenciado para su takedown.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las cifras que aparecen en la model card (215 Hz de polling, 98,8 % de consistencia, 96,5 % en el validador BIP39, 15 hilos de trabajo, menos de 28 MB de RAM) son afirmaciones del autor sin metodología, conjunto de prueba ni reproducibilidad, y no constituyen benchmarks de un modelo de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que inferir).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados del artefacto: Windows 10/11 de 64 bits, ejecución como administrador, ZIP de 8,9 MB, contraseña de extracción `2026`.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles ni pertinentes.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de IA. Frente a herramientas legítimas de recuperación de monederos (por ejemplo, utilidades BIP39 de referencia o el propio flujo de restauración de MetaMask y Trust Wallet, que se ejecuta dentro de la aplicación oficial y nunca solicita la semilla a un binario de terceros), la diferencia relevante es que aquí no hay código auditable ni canal de soporte verificable.

| Criterio | Este artefacto | Restauración oficial en MetaMask / Trust Wallet |
|---|---|---|
| Naturaleza | Binario de terceros sin código fuente | Función integrada en la aplicación oficial |
| Solicita la frase semilla | Sí, según su propia descripción | Sí, pero dentro del cliente firmado y auditado |
| Código auditable | No disponible | Sí (clientes open source en parte) |
| Firma de código | No disponible | Sí |
| Licencia | MIT (declarada) | Varía por cliente |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni integrarse como tal; su presencia en un catálogo de modelos es un error de clasificación o un vector de distribución.
- Riesgo de robo de fondos: cualquier herramienta que pida una frase semilla de 12/24 palabras puede derivar todas las claves privadas y vaciar el monedero. La frase semilla nunca debe introducirse fuera del cliente oficial del monedero.
- Indicadores de campaña maliciosa: ZIP protegido con contraseña para evadir análisis automáticos, instrucciones para ejecutar como administrador, recomendación de desactivar SmartScreen/Defender, badges de descargas y valoraciones no verificables, y enlaces de descarga que apuntan a un repositorio de GitHub (`misasimmons/...`) distinto del autor declarado en Hugging Face.
- Sin trazabilidad: no hay hashes, firma de código, historial de commits ni código fuente que permitan verificar qué hace el binario.
- Licencia MIT declarada: aunque permisiva, no otorga ninguna garantía ni exime de responsabilidad legal por el uso del software; en la UE, el uso de herramientas para acceder a claves de terceros puede infringir normativa penal y de protección de datos.
- Sesgos y alucinación: no aplica en el sentido de un modelo de lenguaje, pero la model card contiene afirmaciones no verificables que funcionan como señuelo.
- Recomendación operativa: bloquear el dominio y el binario en filtros de correo y proxies, y tratar cualquier descarga de este repositorio como incidente de seguridad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Youzzevic/trust-wallet-metamask-seed-recovery
- Repositorio de GitHub referenciado en la model card: https://github.com/misasimmons/trust-wallet-metamask-seed-recovery
- Release referenciada: https://github.com/misasimmons/trust-wallet-metamask-seed-recovery/releases/latest
- Documentación oficial de MetaMask (restauración de monedero): https://support.metamask.io
- Documentación oficial de Trust Wallet: https://trustwallet.com/support
- Especificación BIP39: https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki
- Especificación BIP44: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
